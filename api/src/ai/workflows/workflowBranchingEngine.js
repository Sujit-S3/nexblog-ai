import { aiOrchestrator } from '../orchestrator/orchestrator.js';

export const workflowBranchingEngine = {
  /**
   * Evaluate a branching condition against execution context
   */
  evaluateCondition(context, config) {
    const { conditionField, conditionOperator, conditionValue } = config;
    const actualVal = String(context[conditionField] || '').toLowerCase().trim();
    const targetVal = String(conditionValue || '').toLowerCase().trim();

    if (conditionOperator === 'equals') {
      return actualVal === targetVal;
    } else if (conditionOperator === 'includes') {
      return actualVal.includes(targetVal);
    } else if (conditionOperator === 'greater_than') {
      return parseFloat(actualVal) > parseFloat(targetVal);
    } else if (conditionOperator === 'less_than') {
      return parseFloat(actualVal) < parseFloat(targetVal);
    }
    return false;
  },

  /**
   * Execute an AI workflow chain from startNodeId through all active branches
   */
  async execute({ workflow, initialInput = {}, userId = 'anonymous' }) {
    if (!workflow || !workflow.nodes || workflow.nodes.length === 0) {
      throw new Error('Invalid workflow or empty node list.');
    }

    const nodeMap = new Map();
    workflow.nodes.forEach((node) => nodeMap.set(node.nodeId, node));

    let currentNodeId = workflow.startNodeId || workflow.nodes[0].nodeId;
    const executionTrace = [];
    const context = { ...initialInput, lastOutput: initialInput.prompt || initialInput.topic || '' };
    let stepCount = 0;
    const MAX_STEPS = 15;

    while (currentNodeId && stepCount < MAX_STEPS) {
      stepCount++;
      const node = nodeMap.get(currentNodeId);
      if (!node) {
        executionTrace.push({ step: stepCount, status: 'error', message: `Target node ${currentNodeId} not found in map.` });
        break;
      }

      if (node.type === 'branch_if') {
        const branchPassed = this.evaluateCondition(context, node.config);
        const nextId = branchPassed ? node.config.trueBranchNextId : node.config.falseBranchNextId;
        executionTrace.push({
          step: stepCount,
          nodeId: node.nodeId,
          label: node.label,
          type: 'branch_if',
          conditionEvaluated: `${node.config.conditionField} ${node.config.conditionOperator} "${node.config.conditionValue}"`,
          branchTaken: branchPassed ? 'TRUE' : 'FALSE',
          nextNodeId: nextId,
        });
        currentNodeId = nextId;
      } else {
        // Execute AI Node via orchestrator
        const promptText = node.config.promptTemplate
          ? node.config.promptTemplate.replace(/\{\{lastOutput\}\}/g, context.lastOutput).replace(/\{\{topic\}\}/g, context.topic || '')
          : `Perform ${node.label} on the following context:\n\n${context.lastOutput}`;

        const aiResult = await aiOrchestrator.execute({
          prompt: promptText,
          feature: `workflow-${node.type}`,
          variables: context,
          userId,
        });

        context.lastOutput = aiResult.output || '';
        if (node.type === 'research') context.researchSummary = context.lastOutput;
        else if (node.type === 'citation') context.citations = context.lastOutput;

        executionTrace.push({
          step: stepCount,
          nodeId: node.nodeId,
          label: node.label,
          type: node.type,
          provider: aiResult.provider,
          model: aiResult.model,
          outputPreview: context.lastOutput.slice(0, 300),
          fullOutput: context.lastOutput,
          nextNodeId: node.config.nextId,
        });

        currentNodeId = node.config.nextId;
      }
    }

    return {
      success: true,
      workflowTitle: workflow.title,
      finalOutput: context.lastOutput,
      stepCount,
      executionTrace,
    };
  },
};
