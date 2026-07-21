// package: christiangeorgelucas.github_actions_tools
// file: messages.proto

import * as jspb from "google-protobuf";

export class Workflow extends jspb.Message {
  getYaml(): string;
  setYaml(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Workflow.AsObject;
  static toObject(includeInstance: boolean, msg: Workflow): Workflow.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Workflow, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Workflow;
  static deserializeBinaryFromReader(message: Workflow, reader: jspb.BinaryReader): Workflow;
}

export namespace Workflow {
  export type AsObject = {
    yaml: string,
  }
}

export class JobRequest extends jspb.Message {
  getYaml(): string;
  setYaml(value: string): void;

  getJobId(): string;
  setJobId(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): JobRequest.AsObject;
  static toObject(includeInstance: boolean, msg: JobRequest): JobRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: JobRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): JobRequest;
  static deserializeBinaryFromReader(message: JobRequest, reader: jspb.BinaryReader): JobRequest;
}

export namespace JobRequest {
  export type AsObject = {
    yaml: string,
    jobId: string,
  }
}

export class KeyValue extends jspb.Message {
  getKey(): string;
  setKey(value: string): void;

  getValue(): string;
  setValue(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): KeyValue.AsObject;
  static toObject(includeInstance: boolean, msg: KeyValue): KeyValue.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: KeyValue, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): KeyValue;
  static deserializeBinaryFromReader(message: KeyValue, reader: jspb.BinaryReader): KeyValue;
}

export namespace KeyValue {
  export type AsObject = {
    key: string,
    value: string,
  }
}

export class WorkflowIssue extends jspb.Message {
  getPath(): string;
  setPath(value: string): void;

  getMessage(): string;
  setMessage(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): WorkflowIssue.AsObject;
  static toObject(includeInstance: boolean, msg: WorkflowIssue): WorkflowIssue.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: WorkflowIssue, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): WorkflowIssue;
  static deserializeBinaryFromReader(message: WorkflowIssue, reader: jspb.BinaryReader): WorkflowIssue;
}

export namespace WorkflowIssue {
  export type AsObject = {
    path: string,
    message: string,
  }
}

export class JobBrief extends jspb.Message {
  getJobId(): string;
  setJobId(value: string): void;

  getName(): string;
  setName(value: string): void;

  clearRunsOnList(): void;
  getRunsOnList(): Array<string>;
  setRunsOnList(value: Array<string>): void;
  addRunsOn(value: string, index?: number): string;

  clearNeedsList(): void;
  getNeedsList(): Array<string>;
  setNeedsList(value: Array<string>): void;
  addNeeds(value: string, index?: number): string;

  getIsReusableCall(): boolean;
  setIsReusableCall(value: boolean): void;

  getStepCount(): number;
  setStepCount(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): JobBrief.AsObject;
  static toObject(includeInstance: boolean, msg: JobBrief): JobBrief.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: JobBrief, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): JobBrief;
  static deserializeBinaryFromReader(message: JobBrief, reader: jspb.BinaryReader): JobBrief;
}

export namespace JobBrief {
  export type AsObject = {
    jobId: string,
    name: string,
    runsOnList: Array<string>,
    needsList: Array<string>,
    isReusableCall: boolean,
    stepCount: number,
  }
}

export class ParseWorkflowResult extends jspb.Message {
  getName(): string;
  setName(value: string): void;

  clearTriggerEventsList(): void;
  getTriggerEventsList(): Array<string>;
  setTriggerEventsList(value: Array<string>): void;
  addTriggerEvents(value: string, index?: number): string;

  clearJobsList(): void;
  getJobsList(): Array<JobBrief>;
  setJobsList(value: Array<JobBrief>): void;
  addJobs(value?: JobBrief, index?: number): JobBrief;

  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ParseWorkflowResult.AsObject;
  static toObject(includeInstance: boolean, msg: ParseWorkflowResult): ParseWorkflowResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ParseWorkflowResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ParseWorkflowResult;
  static deserializeBinaryFromReader(message: ParseWorkflowResult, reader: jspb.BinaryReader): ParseWorkflowResult;
}

export namespace ParseWorkflowResult {
  export type AsObject = {
    name: string,
    triggerEventsList: Array<string>,
    jobsList: Array<JobBrief.AsObject>,
    error: string,
  }
}

export class TriggerEvent extends jspb.Message {
  getEvent(): string;
  setEvent(value: string): void;

  clearBranchesList(): void;
  getBranchesList(): Array<string>;
  setBranchesList(value: Array<string>): void;
  addBranches(value: string, index?: number): string;

  clearBranchesIgnoreList(): void;
  getBranchesIgnoreList(): Array<string>;
  setBranchesIgnoreList(value: Array<string>): void;
  addBranchesIgnore(value: string, index?: number): string;

  clearTagsList(): void;
  getTagsList(): Array<string>;
  setTagsList(value: Array<string>): void;
  addTags(value: string, index?: number): string;

  clearTagsIgnoreList(): void;
  getTagsIgnoreList(): Array<string>;
  setTagsIgnoreList(value: Array<string>): void;
  addTagsIgnore(value: string, index?: number): string;

  clearPathsList(): void;
  getPathsList(): Array<string>;
  setPathsList(value: Array<string>): void;
  addPaths(value: string, index?: number): string;

  clearPathsIgnoreList(): void;
  getPathsIgnoreList(): Array<string>;
  setPathsIgnoreList(value: Array<string>): void;
  addPathsIgnore(value: string, index?: number): string;

  clearTypesList(): void;
  getTypesList(): Array<string>;
  setTypesList(value: Array<string>): void;
  addTypes(value: string, index?: number): string;

  clearCronSchedulesList(): void;
  getCronSchedulesList(): Array<string>;
  setCronSchedulesList(value: Array<string>): void;
  addCronSchedules(value: string, index?: number): string;

  clearDeclaredInputsList(): void;
  getDeclaredInputsList(): Array<string>;
  setDeclaredInputsList(value: Array<string>): void;
  addDeclaredInputs(value: string, index?: number): string;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TriggerEvent.AsObject;
  static toObject(includeInstance: boolean, msg: TriggerEvent): TriggerEvent.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: TriggerEvent, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TriggerEvent;
  static deserializeBinaryFromReader(message: TriggerEvent, reader: jspb.BinaryReader): TriggerEvent;
}

export namespace TriggerEvent {
  export type AsObject = {
    event: string,
    branchesList: Array<string>,
    branchesIgnoreList: Array<string>,
    tagsList: Array<string>,
    tagsIgnoreList: Array<string>,
    pathsList: Array<string>,
    pathsIgnoreList: Array<string>,
    typesList: Array<string>,
    cronSchedulesList: Array<string>,
    declaredInputsList: Array<string>,
  }
}

export class ExtractTriggersResult extends jspb.Message {
  clearTriggersList(): void;
  getTriggersList(): Array<TriggerEvent>;
  setTriggersList(value: Array<TriggerEvent>): void;
  addTriggers(value?: TriggerEvent, index?: number): TriggerEvent;

  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ExtractTriggersResult.AsObject;
  static toObject(includeInstance: boolean, msg: ExtractTriggersResult): ExtractTriggersResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ExtractTriggersResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ExtractTriggersResult;
  static deserializeBinaryFromReader(message: ExtractTriggersResult, reader: jspb.BinaryReader): ExtractTriggersResult;
}

export namespace ExtractTriggersResult {
  export type AsObject = {
    triggersList: Array<TriggerEvent.AsObject>,
    error: string,
  }
}

export class PermissionsBlock extends jspb.Message {
  getMode(): string;
  setMode(value: string): void;

  clearScopesList(): void;
  getScopesList(): Array<KeyValue>;
  setScopesList(value: Array<KeyValue>): void;
  addScopes(value?: KeyValue, index?: number): KeyValue;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PermissionsBlock.AsObject;
  static toObject(includeInstance: boolean, msg: PermissionsBlock): PermissionsBlock.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PermissionsBlock, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PermissionsBlock;
  static deserializeBinaryFromReader(message: PermissionsBlock, reader: jspb.BinaryReader): PermissionsBlock;
}

export namespace PermissionsBlock {
  export type AsObject = {
    mode: string,
    scopesList: Array<KeyValue.AsObject>,
  }
}

export class JobInfo extends jspb.Message {
  getJobId(): string;
  setJobId(value: string): void;

  getName(): string;
  setName(value: string): void;

  clearRunsOnList(): void;
  getRunsOnList(): Array<string>;
  setRunsOnList(value: Array<string>): void;
  addRunsOn(value: string, index?: number): string;

  clearNeedsList(): void;
  getNeedsList(): Array<string>;
  setNeedsList(value: Array<string>): void;
  addNeeds(value: string, index?: number): string;

  getIfCondition(): string;
  setIfCondition(value: string): void;

  getTimeoutMinutes(): number;
  setTimeoutMinutes(value: number): void;

  getTimeoutMinutesSpecified(): boolean;
  setTimeoutMinutesSpecified(value: boolean): void;

  getContinueOnError(): boolean;
  setContinueOnError(value: boolean): void;

  getContinueOnErrorSpecified(): boolean;
  setContinueOnErrorSpecified(value: boolean): void;

  getEnvironmentName(): string;
  setEnvironmentName(value: string): void;

  getConcurrencyGroup(): string;
  setConcurrencyGroup(value: string): void;

  getConcurrencyCancelInProgress(): boolean;
  setConcurrencyCancelInProgress(value: boolean): void;

  getConcurrencySpecified(): boolean;
  setConcurrencySpecified(value: boolean): void;

  getContainerImage(): string;
  setContainerImage(value: string): void;

  getIsReusableCall(): boolean;
  setIsReusableCall(value: boolean): void;

  getReusableWorkflowRef(): string;
  setReusableWorkflowRef(value: string): void;

  hasPermissions(): boolean;
  clearPermissions(): void;
  getPermissions(): PermissionsBlock | undefined;
  setPermissions(value?: PermissionsBlock): void;

  getStepCount(): number;
  setStepCount(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): JobInfo.AsObject;
  static toObject(includeInstance: boolean, msg: JobInfo): JobInfo.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: JobInfo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): JobInfo;
  static deserializeBinaryFromReader(message: JobInfo, reader: jspb.BinaryReader): JobInfo;
}

export namespace JobInfo {
  export type AsObject = {
    jobId: string,
    name: string,
    runsOnList: Array<string>,
    needsList: Array<string>,
    ifCondition: string,
    timeoutMinutes: number,
    timeoutMinutesSpecified: boolean,
    continueOnError: boolean,
    continueOnErrorSpecified: boolean,
    environmentName: string,
    concurrencyGroup: string,
    concurrencyCancelInProgress: boolean,
    concurrencySpecified: boolean,
    containerImage: string,
    isReusableCall: boolean,
    reusableWorkflowRef: string,
    permissions?: PermissionsBlock.AsObject,
    stepCount: number,
  }
}

export class ListJobsResult extends jspb.Message {
  clearJobsList(): void;
  getJobsList(): Array<JobInfo>;
  setJobsList(value: Array<JobInfo>): void;
  addJobs(value?: JobInfo, index?: number): JobInfo;

  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListJobsResult.AsObject;
  static toObject(includeInstance: boolean, msg: ListJobsResult): ListJobsResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListJobsResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListJobsResult;
  static deserializeBinaryFromReader(message: ListJobsResult, reader: jspb.BinaryReader): ListJobsResult;
}

export namespace ListJobsResult {
  export type AsObject = {
    jobsList: Array<JobInfo.AsObject>,
    error: string,
  }
}

export class StepInfo extends jspb.Message {
  getIndex(): number;
  setIndex(value: number): void;

  getStepId(): string;
  setStepId(value: string): void;

  getName(): string;
  setName(value: string): void;

  getUses(): string;
  setUses(value: string): void;

  getRun(): string;
  setRun(value: string): void;

  getShell(): string;
  setShell(value: string): void;

  clearWithList(): void;
  getWithList(): Array<KeyValue>;
  setWithList(value: Array<KeyValue>): void;
  addWith(value?: KeyValue, index?: number): KeyValue;

  clearEnvList(): void;
  getEnvList(): Array<KeyValue>;
  setEnvList(value: Array<KeyValue>): void;
  addEnv(value?: KeyValue, index?: number): KeyValue;

  getIfCondition(): string;
  setIfCondition(value: string): void;

  getContinueOnError(): boolean;
  setContinueOnError(value: boolean): void;

  getContinueOnErrorSpecified(): boolean;
  setContinueOnErrorSpecified(value: boolean): void;

  getTimeoutMinutes(): number;
  setTimeoutMinutes(value: number): void;

  getTimeoutMinutesSpecified(): boolean;
  setTimeoutMinutesSpecified(value: boolean): void;

  getWorkingDirectory(): string;
  setWorkingDirectory(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StepInfo.AsObject;
  static toObject(includeInstance: boolean, msg: StepInfo): StepInfo.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: StepInfo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StepInfo;
  static deserializeBinaryFromReader(message: StepInfo, reader: jspb.BinaryReader): StepInfo;
}

export namespace StepInfo {
  export type AsObject = {
    index: number,
    stepId: string,
    name: string,
    uses: string,
    run: string,
    shell: string,
    withList: Array<KeyValue.AsObject>,
    envList: Array<KeyValue.AsObject>,
    ifCondition: string,
    continueOnError: boolean,
    continueOnErrorSpecified: boolean,
    timeoutMinutes: number,
    timeoutMinutesSpecified: boolean,
    workingDirectory: string,
  }
}

export class GetJobStepsResult extends jspb.Message {
  getFound(): boolean;
  setFound(value: boolean): void;

  clearStepsList(): void;
  getStepsList(): Array<StepInfo>;
  setStepsList(value: Array<StepInfo>): void;
  addSteps(value?: StepInfo, index?: number): StepInfo;

  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetJobStepsResult.AsObject;
  static toObject(includeInstance: boolean, msg: GetJobStepsResult): GetJobStepsResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetJobStepsResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetJobStepsResult;
  static deserializeBinaryFromReader(message: GetJobStepsResult, reader: jspb.BinaryReader): GetJobStepsResult;
}

export namespace GetJobStepsResult {
  export type AsObject = {
    found: boolean,
    stepsList: Array<StepInfo.AsObject>,
    error: string,
  }
}

export class ActionRef extends jspb.Message {
  getJobId(): string;
  setJobId(value: string): void;

  getStepIndex(): number;
  setStepIndex(value: number): void;

  getStepName(): string;
  setStepName(value: string): void;

  getRawUses(): string;
  setRawUses(value: string): void;

  getOwner(): string;
  setOwner(value: string): void;

  getRepo(): string;
  setRepo(value: string): void;

  getSubPath(): string;
  setSubPath(value: string): void;

  getRef(): string;
  setRef(value: string): void;

  getRefKind(): string;
  setRefKind(value: string): void;

  getIsShaPinned(): boolean;
  setIsShaPinned(value: boolean): void;

  getIsLocalPath(): boolean;
  setIsLocalPath(value: boolean): void;

  getIsDocker(): boolean;
  setIsDocker(value: boolean): void;

  getDockerImage(): string;
  setDockerImage(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ActionRef.AsObject;
  static toObject(includeInstance: boolean, msg: ActionRef): ActionRef.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ActionRef, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ActionRef;
  static deserializeBinaryFromReader(message: ActionRef, reader: jspb.BinaryReader): ActionRef;
}

export namespace ActionRef {
  export type AsObject = {
    jobId: string,
    stepIndex: number,
    stepName: string,
    rawUses: string,
    owner: string,
    repo: string,
    subPath: string,
    ref: string,
    refKind: string,
    isShaPinned: boolean,
    isLocalPath: boolean,
    isDocker: boolean,
    dockerImage: string,
  }
}

export class ExtractActionsResult extends jspb.Message {
  clearActionsList(): void;
  getActionsList(): Array<ActionRef>;
  setActionsList(value: Array<ActionRef>): void;
  addActions(value?: ActionRef, index?: number): ActionRef;

  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ExtractActionsResult.AsObject;
  static toObject(includeInstance: boolean, msg: ExtractActionsResult): ExtractActionsResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ExtractActionsResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ExtractActionsResult;
  static deserializeBinaryFromReader(message: ExtractActionsResult, reader: jspb.BinaryReader): ExtractActionsResult;
}

export namespace ExtractActionsResult {
  export type AsObject = {
    actionsList: Array<ActionRef.AsObject>,
    error: string,
  }
}

export class JobDependencyEdge extends jspb.Message {
  getJobId(): string;
  setJobId(value: string): void;

  getDependsOn(): string;
  setDependsOn(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): JobDependencyEdge.AsObject;
  static toObject(includeInstance: boolean, msg: JobDependencyEdge): JobDependencyEdge.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: JobDependencyEdge, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): JobDependencyEdge;
  static deserializeBinaryFromReader(message: JobDependencyEdge, reader: jspb.BinaryReader): JobDependencyEdge;
}

export namespace JobDependencyEdge {
  export type AsObject = {
    jobId: string,
    dependsOn: string,
  }
}

export class ExtractJobDependenciesResult extends jspb.Message {
  clearJobIdsList(): void;
  getJobIdsList(): Array<string>;
  setJobIdsList(value: Array<string>): void;
  addJobIds(value: string, index?: number): string;

  clearEdgesList(): void;
  getEdgesList(): Array<JobDependencyEdge>;
  setEdgesList(value: Array<JobDependencyEdge>): void;
  addEdges(value?: JobDependencyEdge, index?: number): JobDependencyEdge;

  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ExtractJobDependenciesResult.AsObject;
  static toObject(includeInstance: boolean, msg: ExtractJobDependenciesResult): ExtractJobDependenciesResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ExtractJobDependenciesResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ExtractJobDependenciesResult;
  static deserializeBinaryFromReader(message: ExtractJobDependenciesResult, reader: jspb.BinaryReader): ExtractJobDependenciesResult;
}

export namespace ExtractJobDependenciesResult {
  export type AsObject = {
    jobIdsList: Array<string>,
    edgesList: Array<JobDependencyEdge.AsObject>,
    error: string,
  }
}

export class MatrixDimension extends jspb.Message {
  getKey(): string;
  setKey(value: string): void;

  clearValuesList(): void;
  getValuesList(): Array<string>;
  setValuesList(value: Array<string>): void;
  addValues(value: string, index?: number): string;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MatrixDimension.AsObject;
  static toObject(includeInstance: boolean, msg: MatrixDimension): MatrixDimension.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MatrixDimension, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MatrixDimension;
  static deserializeBinaryFromReader(message: MatrixDimension, reader: jspb.BinaryReader): MatrixDimension;
}

export namespace MatrixDimension {
  export type AsObject = {
    key: string,
    valuesList: Array<string>,
  }
}

export class MatrixCombination extends jspb.Message {
  clearEntriesList(): void;
  getEntriesList(): Array<KeyValue>;
  setEntriesList(value: Array<KeyValue>): void;
  addEntries(value?: KeyValue, index?: number): KeyValue;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MatrixCombination.AsObject;
  static toObject(includeInstance: boolean, msg: MatrixCombination): MatrixCombination.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MatrixCombination, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MatrixCombination;
  static deserializeBinaryFromReader(message: MatrixCombination, reader: jspb.BinaryReader): MatrixCombination;
}

export namespace MatrixCombination {
  export type AsObject = {
    entriesList: Array<KeyValue.AsObject>,
  }
}

export class ExtractMatrixStrategyResult extends jspb.Message {
  getFound(): boolean;
  setFound(value: boolean): void;

  getHasMatrix(): boolean;
  setHasMatrix(value: boolean): void;

  clearDimensionsList(): void;
  getDimensionsList(): Array<MatrixDimension>;
  setDimensionsList(value: Array<MatrixDimension>): void;
  addDimensions(value?: MatrixDimension, index?: number): MatrixDimension;

  clearIncludeList(): void;
  getIncludeList(): Array<MatrixCombination>;
  setIncludeList(value: Array<MatrixCombination>): void;
  addInclude(value?: MatrixCombination, index?: number): MatrixCombination;

  clearExcludeList(): void;
  getExcludeList(): Array<MatrixCombination>;
  setExcludeList(value: Array<MatrixCombination>): void;
  addExclude(value?: MatrixCombination, index?: number): MatrixCombination;

  getFailFast(): boolean;
  setFailFast(value: boolean): void;

  getFailFastSpecified(): boolean;
  setFailFastSpecified(value: boolean): void;

  getMaxParallel(): number;
  setMaxParallel(value: number): void;

  getMaxParallelSpecified(): boolean;
  setMaxParallelSpecified(value: boolean): void;

  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ExtractMatrixStrategyResult.AsObject;
  static toObject(includeInstance: boolean, msg: ExtractMatrixStrategyResult): ExtractMatrixStrategyResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ExtractMatrixStrategyResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ExtractMatrixStrategyResult;
  static deserializeBinaryFromReader(message: ExtractMatrixStrategyResult, reader: jspb.BinaryReader): ExtractMatrixStrategyResult;
}

export namespace ExtractMatrixStrategyResult {
  export type AsObject = {
    found: boolean,
    hasMatrix: boolean,
    dimensionsList: Array<MatrixDimension.AsObject>,
    includeList: Array<MatrixCombination.AsObject>,
    excludeList: Array<MatrixCombination.AsObject>,
    failFast: boolean,
    failFastSpecified: boolean,
    maxParallel: number,
    maxParallelSpecified: boolean,
    error: string,
  }
}

export class SecretReference extends jspb.Message {
  getJobId(): string;
  setJobId(value: string): void;

  getStepIndex(): number;
  setStepIndex(value: number): void;

  getLocation(): string;
  setLocation(value: string): void;

  getSecretName(): string;
  setSecretName(value: string): void;

  getRawExpression(): string;
  setRawExpression(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SecretReference.AsObject;
  static toObject(includeInstance: boolean, msg: SecretReference): SecretReference.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SecretReference, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SecretReference;
  static deserializeBinaryFromReader(message: SecretReference, reader: jspb.BinaryReader): SecretReference;
}

export namespace SecretReference {
  export type AsObject = {
    jobId: string,
    stepIndex: number,
    location: string,
    secretName: string,
    rawExpression: string,
  }
}

export class ExtractSecretsUsageResult extends jspb.Message {
  clearReferencesList(): void;
  getReferencesList(): Array<SecretReference>;
  setReferencesList(value: Array<SecretReference>): void;
  addReferences(value?: SecretReference, index?: number): SecretReference;

  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ExtractSecretsUsageResult.AsObject;
  static toObject(includeInstance: boolean, msg: ExtractSecretsUsageResult): ExtractSecretsUsageResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ExtractSecretsUsageResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ExtractSecretsUsageResult;
  static deserializeBinaryFromReader(message: ExtractSecretsUsageResult, reader: jspb.BinaryReader): ExtractSecretsUsageResult;
}

export namespace ExtractSecretsUsageResult {
  export type AsObject = {
    referencesList: Array<SecretReference.AsObject>,
    error: string,
  }
}

export class JobEnv extends jspb.Message {
  getJobId(): string;
  setJobId(value: string): void;

  clearEnvList(): void;
  getEnvList(): Array<KeyValue>;
  setEnvList(value: Array<KeyValue>): void;
  addEnv(value?: KeyValue, index?: number): KeyValue;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): JobEnv.AsObject;
  static toObject(includeInstance: boolean, msg: JobEnv): JobEnv.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: JobEnv, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): JobEnv;
  static deserializeBinaryFromReader(message: JobEnv, reader: jspb.BinaryReader): JobEnv;
}

export namespace JobEnv {
  export type AsObject = {
    jobId: string,
    envList: Array<KeyValue.AsObject>,
  }
}

export class StepEnv extends jspb.Message {
  getJobId(): string;
  setJobId(value: string): void;

  getStepIndex(): number;
  setStepIndex(value: number): void;

  getStepName(): string;
  setStepName(value: string): void;

  clearEnvList(): void;
  getEnvList(): Array<KeyValue>;
  setEnvList(value: Array<KeyValue>): void;
  addEnv(value?: KeyValue, index?: number): KeyValue;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StepEnv.AsObject;
  static toObject(includeInstance: boolean, msg: StepEnv): StepEnv.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: StepEnv, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StepEnv;
  static deserializeBinaryFromReader(message: StepEnv, reader: jspb.BinaryReader): StepEnv;
}

export namespace StepEnv {
  export type AsObject = {
    jobId: string,
    stepIndex: number,
    stepName: string,
    envList: Array<KeyValue.AsObject>,
  }
}

export class ExtractEnvVarsResult extends jspb.Message {
  clearWorkflowEnvList(): void;
  getWorkflowEnvList(): Array<KeyValue>;
  setWorkflowEnvList(value: Array<KeyValue>): void;
  addWorkflowEnv(value?: KeyValue, index?: number): KeyValue;

  clearJobEnvList(): void;
  getJobEnvList(): Array<JobEnv>;
  setJobEnvList(value: Array<JobEnv>): void;
  addJobEnv(value?: JobEnv, index?: number): JobEnv;

  clearStepEnvList(): void;
  getStepEnvList(): Array<StepEnv>;
  setStepEnvList(value: Array<StepEnv>): void;
  addStepEnv(value?: StepEnv, index?: number): StepEnv;

  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ExtractEnvVarsResult.AsObject;
  static toObject(includeInstance: boolean, msg: ExtractEnvVarsResult): ExtractEnvVarsResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ExtractEnvVarsResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ExtractEnvVarsResult;
  static deserializeBinaryFromReader(message: ExtractEnvVarsResult, reader: jspb.BinaryReader): ExtractEnvVarsResult;
}

export namespace ExtractEnvVarsResult {
  export type AsObject = {
    workflowEnvList: Array<KeyValue.AsObject>,
    jobEnvList: Array<JobEnv.AsObject>,
    stepEnvList: Array<StepEnv.AsObject>,
    error: string,
  }
}

export class JobPermissions extends jspb.Message {
  getJobId(): string;
  setJobId(value: string): void;

  hasPermissions(): boolean;
  clearPermissions(): void;
  getPermissions(): PermissionsBlock | undefined;
  setPermissions(value?: PermissionsBlock): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): JobPermissions.AsObject;
  static toObject(includeInstance: boolean, msg: JobPermissions): JobPermissions.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: JobPermissions, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): JobPermissions;
  static deserializeBinaryFromReader(message: JobPermissions, reader: jspb.BinaryReader): JobPermissions;
}

export namespace JobPermissions {
  export type AsObject = {
    jobId: string,
    permissions?: PermissionsBlock.AsObject,
  }
}

export class ExtractPermissionsResult extends jspb.Message {
  hasWorkflowPermissions(): boolean;
  clearWorkflowPermissions(): void;
  getWorkflowPermissions(): PermissionsBlock | undefined;
  setWorkflowPermissions(value?: PermissionsBlock): void;

  clearJobPermissionsList(): void;
  getJobPermissionsList(): Array<JobPermissions>;
  setJobPermissionsList(value: Array<JobPermissions>): void;
  addJobPermissions(value?: JobPermissions, index?: number): JobPermissions;

  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ExtractPermissionsResult.AsObject;
  static toObject(includeInstance: boolean, msg: ExtractPermissionsResult): ExtractPermissionsResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ExtractPermissionsResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ExtractPermissionsResult;
  static deserializeBinaryFromReader(message: ExtractPermissionsResult, reader: jspb.BinaryReader): ExtractPermissionsResult;
}

export namespace ExtractPermissionsResult {
  export type AsObject = {
    workflowPermissions?: PermissionsBlock.AsObject,
    jobPermissionsList: Array<JobPermissions.AsObject>,
    error: string,
  }
}

export class RunCommand extends jspb.Message {
  getJobId(): string;
  setJobId(value: string): void;

  getStepIndex(): number;
  setStepIndex(value: number): void;

  getStepName(): string;
  setStepName(value: string): void;

  getShell(): string;
  setShell(value: string): void;

  getScript(): string;
  setScript(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RunCommand.AsObject;
  static toObject(includeInstance: boolean, msg: RunCommand): RunCommand.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: RunCommand, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RunCommand;
  static deserializeBinaryFromReader(message: RunCommand, reader: jspb.BinaryReader): RunCommand;
}

export namespace RunCommand {
  export type AsObject = {
    jobId: string,
    stepIndex: number,
    stepName: string,
    shell: string,
    script: string,
  }
}

export class ExtractRunCommandsResult extends jspb.Message {
  clearCommandsList(): void;
  getCommandsList(): Array<RunCommand>;
  setCommandsList(value: Array<RunCommand>): void;
  addCommands(value?: RunCommand, index?: number): RunCommand;

  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ExtractRunCommandsResult.AsObject;
  static toObject(includeInstance: boolean, msg: ExtractRunCommandsResult): ExtractRunCommandsResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ExtractRunCommandsResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ExtractRunCommandsResult;
  static deserializeBinaryFromReader(message: ExtractRunCommandsResult, reader: jspb.BinaryReader): ExtractRunCommandsResult;
}

export namespace ExtractRunCommandsResult {
  export type AsObject = {
    commandsList: Array<RunCommand.AsObject>,
    error: string,
  }
}

export class RunnerUsage extends jspb.Message {
  getJobId(): string;
  setJobId(value: string): void;

  clearRunsOnList(): void;
  getRunsOnList(): Array<string>;
  setRunsOnList(value: Array<string>): void;
  addRunsOn(value: string, index?: number): string;

  getIsDynamic(): boolean;
  setIsDynamic(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RunnerUsage.AsObject;
  static toObject(includeInstance: boolean, msg: RunnerUsage): RunnerUsage.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: RunnerUsage, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RunnerUsage;
  static deserializeBinaryFromReader(message: RunnerUsage, reader: jspb.BinaryReader): RunnerUsage;
}

export namespace RunnerUsage {
  export type AsObject = {
    jobId: string,
    runsOnList: Array<string>,
    isDynamic: boolean,
  }
}

export class DetectRunnersResult extends jspb.Message {
  clearJobsList(): void;
  getJobsList(): Array<RunnerUsage>;
  setJobsList(value: Array<RunnerUsage>): void;
  addJobs(value?: RunnerUsage, index?: number): RunnerUsage;

  clearDistinctLabelsList(): void;
  getDistinctLabelsList(): Array<string>;
  setDistinctLabelsList(value: Array<string>): void;
  addDistinctLabels(value: string, index?: number): string;

  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DetectRunnersResult.AsObject;
  static toObject(includeInstance: boolean, msg: DetectRunnersResult): DetectRunnersResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DetectRunnersResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DetectRunnersResult;
  static deserializeBinaryFromReader(message: DetectRunnersResult, reader: jspb.BinaryReader): DetectRunnersResult;
}

export namespace DetectRunnersResult {
  export type AsObject = {
    jobsList: Array<RunnerUsage.AsObject>,
    distinctLabelsList: Array<string>,
    error: string,
  }
}

export class ReusableWorkflowCall extends jspb.Message {
  getJobId(): string;
  setJobId(value: string): void;

  getRawUses(): string;
  setRawUses(value: string): void;

  getRefKind(): string;
  setRefKind(value: string): void;

  getIsShaPinned(): boolean;
  setIsShaPinned(value: boolean): void;

  getIsLocalPath(): boolean;
  setIsLocalPath(value: boolean): void;

  clearWithList(): void;
  getWithList(): Array<KeyValue>;
  setWithList(value: Array<KeyValue>): void;
  addWith(value?: KeyValue, index?: number): KeyValue;

  getSecretsInherit(): boolean;
  setSecretsInherit(value: boolean): void;

  clearSecretsList(): void;
  getSecretsList(): Array<KeyValue>;
  setSecretsList(value: Array<KeyValue>): void;
  addSecrets(value?: KeyValue, index?: number): KeyValue;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ReusableWorkflowCall.AsObject;
  static toObject(includeInstance: boolean, msg: ReusableWorkflowCall): ReusableWorkflowCall.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ReusableWorkflowCall, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ReusableWorkflowCall;
  static deserializeBinaryFromReader(message: ReusableWorkflowCall, reader: jspb.BinaryReader): ReusableWorkflowCall;
}

export namespace ReusableWorkflowCall {
  export type AsObject = {
    jobId: string,
    rawUses: string,
    refKind: string,
    isShaPinned: boolean,
    isLocalPath: boolean,
    withList: Array<KeyValue.AsObject>,
    secretsInherit: boolean,
    secretsList: Array<KeyValue.AsObject>,
  }
}

export class ExtractReusableWorkflowCallsResult extends jspb.Message {
  clearCallsList(): void;
  getCallsList(): Array<ReusableWorkflowCall>;
  setCallsList(value: Array<ReusableWorkflowCall>): void;
  addCalls(value?: ReusableWorkflowCall, index?: number): ReusableWorkflowCall;

  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ExtractReusableWorkflowCallsResult.AsObject;
  static toObject(includeInstance: boolean, msg: ExtractReusableWorkflowCallsResult): ExtractReusableWorkflowCallsResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ExtractReusableWorkflowCallsResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ExtractReusableWorkflowCallsResult;
  static deserializeBinaryFromReader(message: ExtractReusableWorkflowCallsResult, reader: jspb.BinaryReader): ExtractReusableWorkflowCallsResult;
}

export namespace ExtractReusableWorkflowCallsResult {
  export type AsObject = {
    callsList: Array<ReusableWorkflowCall.AsObject>,
    error: string,
  }
}

export class SummarizeWorkflowResult extends jspb.Message {
  getJobCount(): number;
  setJobCount(value: number): void;

  getStepCount(): number;
  setStepCount(value: number): void;

  getTriggerEventCount(): number;
  setTriggerEventCount(value: number): void;

  getActionStepCount(): number;
  setActionStepCount(value: number): void;

  getDistinctActionCount(): number;
  setDistinctActionCount(value: number): void;

  getRunStepCount(): number;
  setRunStepCount(value: number): void;

  getReusableCallCount(): number;
  setReusableCallCount(value: number): void;

  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SummarizeWorkflowResult.AsObject;
  static toObject(includeInstance: boolean, msg: SummarizeWorkflowResult): SummarizeWorkflowResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SummarizeWorkflowResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SummarizeWorkflowResult;
  static deserializeBinaryFromReader(message: SummarizeWorkflowResult, reader: jspb.BinaryReader): SummarizeWorkflowResult;
}

export namespace SummarizeWorkflowResult {
  export type AsObject = {
    jobCount: number,
    stepCount: number,
    triggerEventCount: number,
    actionStepCount: number,
    distinctActionCount: number,
    runStepCount: number,
    reusableCallCount: number,
    error: string,
  }
}

export class ValidateWorkflowResult extends jspb.Message {
  getValid(): boolean;
  setValid(value: boolean): void;

  clearIssuesList(): void;
  getIssuesList(): Array<WorkflowIssue>;
  setIssuesList(value: Array<WorkflowIssue>): void;
  addIssues(value?: WorkflowIssue, index?: number): WorkflowIssue;

  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ValidateWorkflowResult.AsObject;
  static toObject(includeInstance: boolean, msg: ValidateWorkflowResult): ValidateWorkflowResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ValidateWorkflowResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ValidateWorkflowResult;
  static deserializeBinaryFromReader(message: ValidateWorkflowResult, reader: jspb.BinaryReader): ValidateWorkflowResult;
}

export namespace ValidateWorkflowResult {
  export type AsObject = {
    valid: boolean,
    issuesList: Array<WorkflowIssue.AsObject>,
    error: string,
  }
}

export class SecurityFinding extends jspb.Message {
  getJobId(): string;
  setJobId(value: string): void;

  getStepIndex(): number;
  setStepIndex(value: number): void;

  getPattern(): string;
  setPattern(value: string): void;

  getDetail(): string;
  setDetail(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SecurityFinding.AsObject;
  static toObject(includeInstance: boolean, msg: SecurityFinding): SecurityFinding.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SecurityFinding, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SecurityFinding;
  static deserializeBinaryFromReader(message: SecurityFinding, reader: jspb.BinaryReader): SecurityFinding;
}

export namespace SecurityFinding {
  export type AsObject = {
    jobId: string,
    stepIndex: number,
    pattern: string,
    detail: string,
  }
}

export class DetectSecurityPatternsResult extends jspb.Message {
  clearFindingsList(): void;
  getFindingsList(): Array<SecurityFinding>;
  setFindingsList(value: Array<SecurityFinding>): void;
  addFindings(value?: SecurityFinding, index?: number): SecurityFinding;

  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DetectSecurityPatternsResult.AsObject;
  static toObject(includeInstance: boolean, msg: DetectSecurityPatternsResult): DetectSecurityPatternsResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DetectSecurityPatternsResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DetectSecurityPatternsResult;
  static deserializeBinaryFromReader(message: DetectSecurityPatternsResult, reader: jspb.BinaryReader): DetectSecurityPatternsResult;
}

export namespace DetectSecurityPatternsResult {
  export type AsObject = {
    findingsList: Array<SecurityFinding.AsObject>,
    error: string,
  }
}

