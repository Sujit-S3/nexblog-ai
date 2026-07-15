import mongoose from 'mongoose';

const workflowNodeSchema = new mongoose.Schema({
  nodeId: { type: String, required: true },
  label: { type: String, required: true },
  type: {
    type: String,
    enum: ['research', 'writer', 'seo', 'citation', 'grammar', 'social', 'branch_if', 'custom'],
    required: true,
  },
  config: {
    promptTemplate: { type: String, default: '' },
    // Conditional logic fields for 'branch_if' nodes
    conditionField: { type: String, default: 'category' }, // e.g., 'category', 'topic', 'wordCount'
    conditionOperator: { type: String, enum: ['equals', 'includes', 'greater_than', 'less_than'], default: 'equals' },
    conditionValue: { type: String, default: 'Academic' },
    trueBranchNextId: { type: String, default: null },
    falseBranchNextId: { type: String, default: null },
    nextId: { type: String, default: null },
  },
});

const aiWorkflowSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    isTemplate: {
      type: Boolean,
      default: false,
    },
    nodes: [workflowNodeSchema],
    edges: [
      {
        source: { type: String },
        target: { type: String },
        label: { type: String },
      },
    ],
    startNodeId: {
      type: String,
      required: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    author: {
      type: String,
      default: 'Technical Team',
    },
    changeHistory: [
      {
        version: { type: Number },
        nodes: { type: Array },
        edges: { type: Array },
        updatedAt: { type: String },
        updatedBy: { type: String },
      },
    ],
    executionHistory: [
      {
        executionId: { type: String },
        status: { type: String },
        durationMs: { type: Number },
        executedAt: { type: String },
        inputs: { type: Object },
        outputSummary: { type: String },
      },
    ],
  },
  { timestamps: true }
);

aiWorkflowSchema.index({ userId: 1, isTemplate: 1, updatedAt: -1 });
aiWorkflowSchema.index({ isTemplate: 1, updatedAt: -1 });

const AiWorkflow = mongoose.model('AiWorkflow', aiWorkflowSchema);
export default AiWorkflow;
