import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        role: {
          type: String,
          enum: ['lead', 'contributor', 'viewer'],
          default: 'contributor',
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    status: {
      type: String,
      enum: {
        values: ['planning', 'active', 'on-hold', 'completed', 'archived'],
        message: '{VALUE} is not a valid status',
      },
      default: 'planning',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    deadline: {
      type: Date,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    color: {
      type: String,
      default: '#0f62fe',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for task count
projectSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'projectId',
});

// Virtual for progress (calculated from tasks)
projectSchema.virtual('progress').get(function () {
  return undefined; // Calculated in controller with aggregation
});

// Index for efficient queries
projectSchema.index({ createdBy: 1 });
projectSchema.index({ 'members.user': 1 });
projectSchema.index({ status: 1 });

const Project = mongoose.model('Project', projectSchema);

export default Project;
