import React, { useState, useEffect } from 'react';
import { GitBranch, Play, Plus, Trash2, Save, Loader2, Sparkles, Layers, Sliders } from 'lucide-react';

const NODE_TYPES = [
  { id: 'research', label: 'Deep Research Agent', color: 'from-blue-600 to-cyan-600', desc: 'Synthesizes sources into technical outlines' },
  { id: 'writer', label: 'Publication Writer', color: 'from-purple-600 to-indigo-600', desc: 'Drafts publication-grade content' },
  { id: 'citation', label: 'Citation & Reference Anchor', color: 'from-emerald-600 to-teal-600', desc: 'Injects vector anchor citations' },
  { id: 'seo', label: 'SEO & Metadata Auditor', color: 'from-amber-600 to-orange-600', desc: 'Optimizes keywords and metadata' },
  { id: 'grammar', label: 'Grammar & Polish Pass', color: 'from-pink-600 to-rose-600', desc: 'Refines syntax and flow' },
  { id: 'branch_if', label: 'Conditional IF / ELSE Branch', color: 'from-fuchsia-600 to-purple-800', desc: 'Routes execution based on rules' },
];

export default function AIWorkflowStudio() {
  const [, setWorkflows] = useState([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState(null);
  const [title, setTitle] = useState('New Branching Pipeline');
  const [description, setDescription] = useState('Custom AI chain with conditional logic');
  const [nodes, setNodes] = useState([
    {
      nodeId: 'node-1',
      label: 'Deep Research Step',
      type: 'research',
      config: { promptTemplate: 'Research and summarize key findings on {{topic}}.', nextId: 'node-2' },
    },
    {
      nodeId: 'node-2',
      label: 'Category Condition Branch',
      type: 'branch_if',
      config: {
        conditionField: 'category',
        conditionOperator: 'equals',
        conditionValue: 'Academic',
        trueBranchNextId: 'node-3',
        falseBranchNextId: 'node-4',
      },
    },
    {
      nodeId: 'node-3',
      label: 'Formal Academic Writer',
      type: 'writer',
      config: { promptTemplate: 'Write a rigorous academic analysis with formal terminology based on:\n\n{{lastOutput}}', nextId: null },
    },
    {
      nodeId: 'node-4',
      label: 'Engaging Marketing Writer',
      type: 'writer',
      config: { promptTemplate: 'Write a high-converting, punchy marketing post based on:\n\n{{lastOutput}}', nextId: null },
    },
  ]);

  const [inputTopic, setInputTopic] = useState('Quantum Error Correction in 2026');
  const [inputCategory, setInputCategory] = useState('Academic');
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const res = await fetch('/api/ai/list-workflows');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.workflows.length > 0) {
          setWorkflows(data.workflows);
        }
      }
    } catch (err) {
      console.error('Failed to load workflows:', err);
    }
  };

  const handleAddNode = (typeObj) => {
    const newId = `node-${Date.now()}`;
    const newNode = {
      nodeId: newId,
      label: `${typeObj.label}`,
      type: typeObj.id,
      config: typeObj.id === 'branch_if' ? {
        conditionField: 'category',
        conditionOperator: 'equals',
        conditionValue: 'Academic',
        trueBranchNextId: null,
        falseBranchNextId: null,
      } : {
        promptTemplate: `Execute ${typeObj.label} on:\n\n{{lastOutput}}`,
        nextId: null,
      },
    };

    // If there are existing nodes and the last one wasn't a branch, link its nextId to this new node
    const updated = [...nodes];
    if (updated.length > 0) {
      const last = updated[updated.length - 1];
      if (last.type !== 'branch_if' && !last.config.nextId) {
        last.config.nextId = newId;
      }
    }

    setNodes([...updated, newNode]);
  };

  const handleDeleteNode = (id) => {
    setNodes(nodes.filter(n => n.nodeId !== id));
  };

  const handleUpdateConfig = (nodeId, key, val) => {
    setNodes(nodes.map(n => {
      if (n.nodeId === nodeId) {
        return {
          ...n,
          config: { ...n.config, [key]: val },
        };
      }
      return n;
    }));
  };

  const handleSaveWorkflow = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/ai/save-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowId: selectedWorkflowId,
          title,
          description,
          nodes,
          startNodeId: nodes[0]?.nodeId,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSelectedWorkflowId(data.workflow._id);
          fetchWorkflows();
          alert('Workflow saved successfully!');
        }
      }
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleRunWorkflow = async () => {
    setExecuting(true);
    setExecutionResult(null);
    try {
      const res = await fetch('/api/ai/run-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowId: selectedWorkflowId,
          workflow: { title, nodes, startNodeId: nodes[0]?.nodeId },
          initialInput: { topic: inputTopic, category: inputCategory },
        }),
      });
      const data = await res.json();
      setExecutionResult(data);
    } catch (err) {
      setExecutionResult({ success: false, message: err.message });
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
              <GitBranch className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-transparent font-bold text-xl text-white focus:outline-none focus:border-b border-purple-500"
                />
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">V3.2 Engine</span>
              </div>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-transparent text-xs text-slate-400 w-full focus:outline-none mt-1"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveWorkflow}
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium transition flex items-center gap-2 border border-slate-700"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Pipeline
            </button>
            <button
              onClick={handleRunWorkflow}
              disabled={executing || nodes.length === 0}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:opacity-90 text-white font-medium text-sm shadow-xl shadow-purple-500/30 transition flex items-center gap-2 disabled:opacity-50"
            >
              {executing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />} Execute Branching Chain
            </button>
          </div>
        </div>

        {/* Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Node Builder Column (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" /> Pipeline Nodes & Conditional Flow
              </h3>
              <span className="text-xs text-slate-400">{nodes.length} nodes configured</span>
            </div>

            <div className="space-y-4">
              {nodes.map((node, idx) => (
                <div
                  key={node.nodeId}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl relative transition hover:border-slate-700"
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-purple-400">
                        {idx + 1}
                      </span>
                      <div>
                        <input
                          type="text"
                          value={node.label}
                          onChange={(e) => setNodes(nodes.map(n => n.nodeId === node.nodeId ? { ...n, label: e.target.value } : n))}
                          className="bg-transparent font-semibold text-sm text-white focus:outline-none"
                        />
                        <span className="block text-[11px] uppercase tracking-wider text-slate-400 font-mono mt-0.5">
                          {node.type} node • ID: {node.nodeId}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteNode(node.nodeId)}
                      className="p-1.5 text-slate-500 hover:text-red-400 rounded transition"
                      title="Delete node"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Node Specific Config */}
                  {node.type === 'branch_if' ? (
                    <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/30 space-y-3 text-xs">
                      <div className="font-semibold text-purple-300 flex items-center gap-1.5">
                        <GitBranch className="w-4 h-4 text-purple-400" /> Conditional IF / ELSE Rule
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-slate-400 mb-1">Variable Field</label>
                          <input
                            type="text"
                            value={node.config.conditionField}
                            onChange={(e) => handleUpdateConfig(node.nodeId, 'conditionField', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1">Operator</label>
                          <select
                            value={node.config.conditionOperator}
                            onChange={(e) => handleUpdateConfig(node.nodeId, 'conditionOperator', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white"
                          >
                            <option value="equals">equals</option>
                            <option value="includes">includes</option>
                            <option value="greater_than">greater than</option>
                            <option value="less_than">less than</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1">Target Value</label>
                          <input
                            type="text"
                            value={node.config.conditionValue}
                            onChange={(e) => handleUpdateConfig(node.nodeId, 'conditionValue', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                        <div className="p-2 rounded bg-emerald-950/20 border border-emerald-500/30">
                          <span className="text-emerald-400 font-bold block mb-1">TRUE → Route To Node ID:</span>
                          <input
                            type="text"
                            placeholder="e.g., node-3"
                            value={node.config.trueBranchNextId || ''}
                            onChange={(e) => handleUpdateConfig(node.nodeId, 'trueBranchNextId', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white font-mono"
                          />
                        </div>
                        <div className="p-2 rounded bg-red-950/20 border border-red-500/30">
                          <span className="text-red-400 font-bold block mb-1">FALSE → Route To Node ID:</span>
                          <input
                            type="text"
                            placeholder="e.g., node-4"
                            value={node.config.falseBranchNextId || ''}
                            onChange={(e) => handleUpdateConfig(node.nodeId, 'falseBranchNextId', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-slate-400 mb-1">Prompt Instruction Template (use {"{{topic}}"} or {"{{lastOutput}}"}</label>
                        <textarea
                          rows={3}
                          value={node.config.promptTemplate}
                          onChange={(e) => handleUpdateConfig(node.nodeId, 'promptTemplate', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono text-xs focus:outline-none focus:border-purple-500 resize-none"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Next Node ID:</span>
                        <input
                          type="text"
                          placeholder="e.g., node-2 or leave empty if terminal"
                          value={node.config.nextId || ''}
                          onChange={(e) => handleUpdateConfig(node.nodeId, 'nextId', e.target.value)}
                          className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-white font-mono w-48"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add Node Palette */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Add Execution Step or Branch</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {NODE_TYPES.map((typeObj) => (
                  <button
                    key={typeObj.id}
                    onClick={() => handleAddNode(typeObj)}
                    className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/50 text-left transition flex flex-col justify-between group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs text-white group-hover:text-purple-300">{typeObj.label}</span>
                      <Plus className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400" />
                    </div>
                    <span className="text-[10px] text-slate-400 line-clamp-1">{typeObj.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Test Runner & Live Trace Column */}
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-400" /> Test Execution Inputs
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Target Topic / Input</label>
                  <input
                    type="text"
                    value={inputTopic}
                    onChange={(e) => setInputTopic(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Category Variable (For Branching Rule)</label>
                  <select
                    value={inputCategory}
                    onChange={(e) => setInputCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="Academic">Academic (Routes to Formal Writer)</option>
                    <option value="Marketing">Marketing (Routes to Engaging Writer)</option>
                    <option value="Technical">Technical</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Live Trace Monitor */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" /> Live Execution Trace
              </h3>

              {executing && (
                <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-3">
                  <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin mx-auto" />
                  <p className="text-xs font-medium text-slate-300">Traversing nodes & evaluating IF/ELSE rules...</p>
                </div>
              )}

              {executionResult && (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1 text-xs">
                  {executionResult.executionTrace?.map((step, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-purple-400">Step {step.step}: {step.label}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400">{step.type}</span>
                      </div>

                      {step.type === 'branch_if' ? (
                        <div className="p-2 rounded bg-purple-950/20 border border-purple-500/30 text-[11px]">
                          <span className="text-slate-300">Rule: {step.conditionEvaluated}</span>
                          <div className="mt-1 font-bold text-emerald-400">
                            → Decision: {step.branchTaken} (Routed to {step.nextNodeId})
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="text-[10px] text-slate-500">Provider: {step.provider} ({step.model})</div>
                          <p className="text-slate-300 italic bg-slate-900/60 p-2 rounded border border-slate-800/80 line-clamp-3 font-mono text-[11px]">
                            {step.outputPreview}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="pt-2">
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Final Chain Output:</span>
                    <div className="mt-1 p-3 rounded-xl bg-slate-950 border border-purple-500/30 font-mono text-xs text-purple-200 whitespace-pre-wrap max-h-48 overflow-y-auto">
                      {executionResult.finalOutput}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
