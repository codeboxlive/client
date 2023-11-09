export enum JoinType {
  UserId,
  ProjectId,
  TeamsThreadId,
}

export interface IJoin {
  id1: string;
  id1Type: JoinType;
  id2: string;
  id2Type: JoinType;
  date: Date;
  userId: string;
}
