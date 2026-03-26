import type {
  DclawAgentDefinition,
  DclawJsonSchema,
  DclawPackageManifest,
  DclawPermissionSet,
  DclawSkillDefinition,
  DclawTaskTemplate,
  DclawWorkflowDefinition
} from '../../shared/types';

const OFFICIAL_PUBLISHER = {
  id: 'dclaw-official',
  name: 'Dclaw Official',
  kind: 'official' as const,
  verified: true
};

function stringSchema(description: string): DclawJsonSchema {
  return { type: 'string', description };
}

function objectSchema(
  properties: Record<string, DclawJsonSchema>,
  required: string[] = []
): DclawJsonSchema {
  return {
    type: 'object',
    properties,
    required,
    additionalProperties: false
  };
}

const filesystemPermissions: DclawPermissionSet = {
  keys: ['filesystem.read', 'filesystem.write'],
  pathScopes: ['user-selected'],
  requiresConfirmation: true
};

const officePermissions: DclawPermissionSet = {
  keys: ['filesystem.read', 'filesystem.write', 'office.excel', 'office.word', 'office.ppt'],
  pathScopes: ['user-selected'],
  requiresConfirmation: true
};

const reportPermissions: DclawPermissionSet = {
  keys: ['filesystem.read', 'filesystem.write', 'git.read', 'model.invoke'],
  pathScopes: ['user-selected'],
  requiresConfirmation: true
};

export const builtInPackageManifests: DclawPackageManifest[] = [
  {
    schemaVersion: '1.0',
    id: 'dclaw.skill.filesystem',
    name: 'Filesystem Skill',
    type: 'skill',
    version: '0.1.0',
    publisher: OFFICIAL_PUBLISHER,
    description: 'Read, write, merge, and browse local files and folders.',
    entry: { runtime: 'builtin', module: 'file-service', exportName: 'filesystem' },
    permissions: filesystemPermissions,
    tags: ['filesystem', 'files', 'folders'],
    visibility: 'public'
  },
  {
    schemaVersion: '1.0',
    id: 'dclaw.skill.office',
    name: 'Office Skill',
    type: 'skill',
    version: '0.1.0',
    publisher: OFFICIAL_PUBLISHER,
    description: 'Merge Excel files and generate Word or PPT outputs.',
    entry: { runtime: 'builtin', module: 'office-service', exportName: 'office' },
    permissions: officePermissions,
    tags: ['office', 'excel', 'word', 'ppt'],
    visibility: 'public'
  },
  {
    schemaVersion: '1.0',
    id: 'dclaw.skill.git-report',
    name: 'Git Report Skill',
    type: 'skill',
    version: '0.1.0',
    publisher: OFFICIAL_PUBLISHER,
    description: 'Generate weekly and monthly reports from local git repositories.',
    entry: { runtime: 'builtin', module: 'git-report-service', exportName: 'gitReport' },
    permissions: reportPermissions,
    tags: ['git', 'report', 'weekly', 'monthly'],
    visibility: 'public'
  },
  {
    schemaVersion: '1.0',
    id: 'dclaw.agent.general-assistant',
    name: 'General Assistant',
    type: 'agent',
    version: '0.1.0',
    publisher: OFFICIAL_PUBLISHER,
    description: 'Routes everyday tasks to file, office, and report skills.',
    entry: { runtime: 'builtin', module: 'orchestrator', exportName: 'generalAssistant' },
    permissions: {
      keys: ['filesystem.read', 'filesystem.write', 'model.invoke'],
      pathScopes: ['user-selected'],
      requiresConfirmation: true
    },
    tags: ['assistant', 'general'],
    visibility: 'public'
  },
  {
    schemaVersion: '1.0',
    id: 'dclaw.agent.file-assistant',
    name: 'File Assistant',
    type: 'agent',
    version: '0.1.0',
    publisher: OFFICIAL_PUBLISHER,
    description: 'Focuses on local file and folder operations.',
    entry: { runtime: 'builtin', module: 'orchestrator', exportName: 'fileAssistant' },
    permissions: filesystemPermissions,
    tags: ['assistant', 'files'],
    visibility: 'public'
  },
  {
    schemaVersion: '1.0',
    id: 'dclaw.agent.report-assistant',
    name: 'Report Assistant',
    type: 'agent',
    version: '0.1.0',
    publisher: OFFICIAL_PUBLISHER,
    description: 'Generates work reports and document outputs from local sources.',
    entry: { runtime: 'builtin', module: 'orchestrator', exportName: 'reportAssistant' },
    permissions: reportPermissions,
    tags: ['assistant', 'reporting'],
    visibility: 'public'
  },
  {
    schemaVersion: '1.0',
    id: 'dclaw.workflow.weekly-report',
    name: 'Weekly Report Workflow',
    type: 'workflow',
    version: '0.1.0',
    publisher: OFFICIAL_PUBLISHER,
    description: 'Generate a weekly markdown work report from git history.',
    entry: { runtime: 'builtin', module: 'workflow', exportName: 'weeklyReport' },
    permissions: reportPermissions,
    tags: ['workflow', 'weekly', 'report'],
    visibility: 'public'
  },
  {
    schemaVersion: '1.0',
    id: 'dclaw.workflow.monthly-report',
    name: 'Monthly Report Workflow',
    type: 'workflow',
    version: '0.1.0',
    publisher: OFFICIAL_PUBLISHER,
    description: 'Generate a monthly markdown work report from git history.',
    entry: { runtime: 'builtin', module: 'workflow', exportName: 'monthlyReport' },
    permissions: reportPermissions,
    tags: ['workflow', 'monthly', 'report'],
    visibility: 'public'
  },
  {
    schemaVersion: '1.0',
    id: 'dclaw.workflow.merge-excel',
    name: 'Merge Excel Workflow',
    type: 'workflow',
    version: '0.1.0',
    publisher: OFFICIAL_PUBLISHER,
    description: 'Combine multiple Excel files into a single output workbook.',
    entry: { runtime: 'builtin', module: 'workflow', exportName: 'mergeExcel' },
    permissions: officePermissions,
    tags: ['workflow', 'excel', 'office'],
    visibility: 'public'
  },
  {
    schemaVersion: '1.0',
    id: 'dclaw.workflow.summarize-folder',
    name: 'Summarize Folder Workflow',
    type: 'workflow',
    version: '0.1.0',
    publisher: OFFICIAL_PUBLISHER,
    description: 'Read a folder of local notes or text files and produce a summary.',
    entry: { runtime: 'builtin', module: 'workflow', exportName: 'summarizeFolder' },
    permissions: filesystemPermissions,
    tags: ['workflow', 'summary', 'files'],
    visibility: 'public'
  }
];

export const builtInSkillDefinitions: DclawSkillDefinition[] = [
  {
    id: 'dclaw.skill.filesystem',
    name: 'Filesystem Skill',
    description: 'Read, write, merge, and browse local files and folders.',
    version: '0.1.0',
    packageId: 'dclaw.skill.filesystem',
    entrypoint: 'builtin:file-service',
    permissions: filesystemPermissions,
    inputSchema: objectSchema(
      {
        path: stringSchema('Target file or folder path'),
        outputPath: stringSchema('Optional output path')
      },
      ['path']
    ),
    outputSchema: objectSchema({
      content: stringSchema('The resulting content or operation summary')
    }),
    tags: ['filesystem', 'files', 'folders'],
    enabled: true
  },
  {
    id: 'dclaw.skill.office',
    name: 'Office Skill',
    description: 'Merge Excel files and generate Word or PPT outputs.',
    version: '0.1.0',
    packageId: 'dclaw.skill.office',
    entrypoint: 'builtin:office-service',
    permissions: officePermissions,
    inputSchema: objectSchema({
      files: {
        type: 'array',
        description: 'Source Office files',
        items: stringSchema('Source file path')
      },
      outputPath: stringSchema('Target output file')
    }),
    outputSchema: objectSchema({
      outputPath: stringSchema('Generated output path'),
      message: stringSchema('Operation result message')
    }),
    tags: ['office', 'excel', 'word', 'ppt'],
    enabled: true
  },
  {
    id: 'dclaw.skill.git-report',
    name: 'Git Report Skill',
    description: 'Generate weekly and monthly reports from local git repositories.',
    version: '0.1.0',
    packageId: 'dclaw.skill.git-report',
    entrypoint: 'builtin:git-report-service',
    permissions: reportPermissions,
    inputSchema: objectSchema(
      {
        sourcePath: stringSchema('Repository path or workspace path'),
        preset: {
          type: 'string',
          description: 'Report preset',
          enum: ['week', 'month', 'custom']
        }
      },
      ['sourcePath', 'preset']
    ),
    outputSchema: objectSchema({
      markdown: stringSchema('Generated markdown report')
    }),
    tags: ['git', 'report', 'weekly', 'monthly'],
    enabled: true
  }
];

export const builtInAgentDefinitions: DclawAgentDefinition[] = [
  {
    id: 'dclaw.agent.general-assistant',
    name: 'General Assistant',
    description: 'Routes everyday work requests to the most relevant local skills.',
    version: '0.1.0',
    packageId: 'dclaw.agent.general-assistant',
    systemPrompt:
      'Handle local productivity requests. Prefer built-in file, office, and reporting skills before external connectors.',
    availableSkillIds: builtInSkillDefinitions.map((skill) => skill.id),
    defaultModel: 'gpt-5.2',
    connectorId: 'openclaw',
    tags: ['assistant', 'general'],
    enabled: true
  },
  {
    id: 'dclaw.agent.file-assistant',
    name: 'File Assistant',
    description: 'Focuses on local file and folder processing tasks.',
    version: '0.1.0',
    packageId: 'dclaw.agent.file-assistant',
    systemPrompt: 'Specialize in reading, writing, organizing, and summarizing local files.',
    availableSkillIds: ['dclaw.skill.filesystem'],
    defaultModel: 'gpt-5.2',
    tags: ['assistant', 'files'],
    enabled: true
  },
  {
    id: 'dclaw.agent.report-assistant',
    name: 'Report Assistant',
    description: 'Specializes in weekly and monthly work reports.',
    version: '0.1.0',
    packageId: 'dclaw.agent.report-assistant',
    systemPrompt: 'Generate clear work reports using local git and file inputs.',
    availableSkillIds: ['dclaw.skill.git-report', 'dclaw.skill.office', 'dclaw.skill.filesystem'],
    defaultModel: 'gpt-5.2',
    tags: ['assistant', 'reporting'],
    enabled: true
  }
];

export const builtInWorkflowDefinitions: DclawWorkflowDefinition[] = [
  {
    id: 'dclaw.workflow.weekly-report',
    name: 'Weekly Report Workflow',
    description: 'Generate a weekly markdown work report from git history.',
    version: '0.1.0',
    packageId: 'dclaw.workflow.weekly-report',
    requiredSkillIds: ['dclaw.skill.git-report'],
    steps: [
      {
        id: 'collect-git-history',
        kind: 'skill',
        targetId: 'dclaw.skill.git-report',
        description: 'Generate a weekly report from repository history.',
        input: {
          operation: 'generate-report',
          preset: 'week'
        }
      }
    ],
    inputSchema: objectSchema(
      {
        sourcePath: stringSchema('Repository root or workspace root'),
        sourceMode: {
          type: 'string',
          description: 'Whether the source path points to one repository or a workspace',
          enum: ['repository', 'workspace']
        },
        outputPath: stringSchema('Optional markdown output path'),
        author: stringSchema('Optional author filter'),
        depth: {
          type: 'integer',
          description: 'Optional directory scan depth when source mode is workspace'
        }
      },
      ['sourcePath']
    ),
    outputSchema: objectSchema({
      markdown: stringSchema('Weekly report markdown')
    }),
    tags: ['workflow', 'weekly', 'report'],
    enabled: true
  },
  {
    id: 'dclaw.workflow.monthly-report',
    name: 'Monthly Report Workflow',
    description: 'Generate a monthly markdown work report from git history.',
    version: '0.1.0',
    packageId: 'dclaw.workflow.monthly-report',
    requiredSkillIds: ['dclaw.skill.git-report'],
    steps: [
      {
        id: 'collect-monthly-git-history',
        kind: 'skill',
        targetId: 'dclaw.skill.git-report',
        description: 'Generate a monthly report from repository history.',
        input: {
          operation: 'generate-report',
          preset: 'month'
        }
      }
    ],
    inputSchema: objectSchema(
      {
        sourcePath: stringSchema('Repository root or workspace root'),
        sourceMode: {
          type: 'string',
          description: 'Whether the source path points to one repository or a workspace',
          enum: ['repository', 'workspace']
        },
        outputPath: stringSchema('Optional markdown output path'),
        author: stringSchema('Optional author filter'),
        depth: {
          type: 'integer',
          description: 'Optional directory scan depth when source mode is workspace'
        }
      },
      ['sourcePath']
    ),
    outputSchema: objectSchema({
      markdown: stringSchema('Monthly report markdown')
    }),
    tags: ['workflow', 'monthly', 'report'],
    enabled: true
  },
  {
    id: 'dclaw.workflow.merge-excel',
    name: 'Merge Excel Workflow',
    description: 'Combine multiple Excel files into a single output workbook.',
    version: '0.1.0',
    packageId: 'dclaw.workflow.merge-excel',
    requiredSkillIds: ['dclaw.skill.office'],
    steps: [
      {
        id: 'merge-excel-files',
        kind: 'skill',
        targetId: 'dclaw.skill.office',
        description: 'Merge the selected Excel files into one workbook.',
        input: {
          operation: 'merge-excel'
        }
      }
    ],
    inputSchema: objectSchema(
      {
        files: {
          type: 'array',
          description: 'Source excel files',
          items: stringSchema('Source excel file')
        },
        outputPath: stringSchema('Merged workbook output path'),
        sheetName: stringSchema('Optional target sheet name')
      },
      ['files', 'outputPath']
    ),
    outputSchema: objectSchema({
      outputPath: stringSchema('Merged workbook path')
    }),
    tags: ['workflow', 'excel', 'office'],
    enabled: true
  },
  {
    id: 'dclaw.workflow.summarize-folder',
    name: 'Summarize Folder Workflow',
    description: 'Read local notes or text files in a folder and produce a summary.',
    version: '0.1.0',
    packageId: 'dclaw.workflow.summarize-folder',
    requiredSkillIds: ['dclaw.skill.filesystem'],
    steps: [
      {
        id: 'scan-folder',
        kind: 'skill',
        targetId: 'dclaw.skill.filesystem',
        description: 'Browse the target directory and collect readable files.',
        input: {
          operation: 'summarize-folder'
        }
      }
    ],
    inputSchema: objectSchema(
      {
        path: stringSchema('Directory to summarize'),
        outputPath: stringSchema('Optional markdown output path')
      },
      ['path']
    ),
    outputSchema: objectSchema({
      content: stringSchema('Summary result')
    }),
    tags: ['workflow', 'summary', 'files'],
    enabled: true
  }
];

export const builtInTaskTemplates: DclawTaskTemplate[] = [
  {
    id: 'dclaw.task-template.weekly-report',
    name: 'Weekly Report',
    description: 'Generate a weekly work report from a repository or workspace.',
    workflowId: 'dclaw.workflow.weekly-report',
    category: 'reporting',
    formSchema: objectSchema(
      {
        sourcePath: stringSchema('Repository root or workspace root'),
        sourceMode: {
          type: 'string',
          description: 'Source selection mode',
          enum: ['repository', 'workspace']
        },
        outputPath: stringSchema('Optional markdown output path')
      },
      ['sourcePath']
    ),
    defaultInputs: {
      sourcePath: '',
      sourceMode: 'workspace',
      outputPath: ''
    },
    enabled: true
  },
  {
    id: 'dclaw.task-template.monthly-report',
    name: 'Monthly Report',
    description: 'Generate a monthly work report from a repository or workspace.',
    workflowId: 'dclaw.workflow.monthly-report',
    category: 'reporting',
    formSchema: objectSchema(
      {
        sourcePath: stringSchema('Repository root or workspace root'),
        sourceMode: {
          type: 'string',
          description: 'Source selection mode',
          enum: ['repository', 'workspace']
        },
        outputPath: stringSchema('Optional markdown output path')
      },
      ['sourcePath']
    ),
    defaultInputs: {
      sourcePath: '',
      sourceMode: 'workspace',
      outputPath: ''
    },
    enabled: true
  },
  {
    id: 'dclaw.task-template.merge-excel',
    name: 'Merge Excel Files',
    description: 'Merge multiple Excel files into a single workbook.',
    workflowId: 'dclaw.workflow.merge-excel',
    category: 'office',
    formSchema: objectSchema(
      {
        files: {
          type: 'array',
          description: 'Source excel files',
          items: stringSchema('Source excel file')
        },
        outputPath: stringSchema('Target output file'),
        sheetName: stringSchema('Optional target sheet name')
      },
      ['files', 'outputPath']
    ),
    defaultInputs: {
      files: [],
      outputPath: '',
      sheetName: 'MergedData'
    },
    enabled: true
  },
  {
    id: 'dclaw.task-template.summarize-folder',
    name: 'Summarize Folder',
    description: 'Scan a folder, sample readable files, and generate a markdown summary.',
    workflowId: 'dclaw.workflow.summarize-folder',
    category: 'files',
    formSchema: objectSchema(
      {
        path: stringSchema('Directory to summarize'),
        outputPath: stringSchema('Optional markdown output path')
      },
      ['path']
    ),
    defaultInputs: {
      path: '',
      outputPath: ''
    },
    enabled: true
  }
];
