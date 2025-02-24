import { Collection } from '@discordjs/collection';
import { ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import { Client, ClientOptions, ShardingManagerMode, Serialized, Awaited, Snowflake, ShardClientUtil } from 'discord.js';
import { Worker } from 'cluster';

type If<T extends boolean, A, B = null> = T extends true ? A : T extends false ? B : A | B;

export class ClusterClient<Ready extends boolean = boolean> extends Client<Ready> {
  public constructor(options: ClientOptions);
  public cluster: If<Ready, ClusterClientUtil>;
  public shard: If<Ready, ShardClientUtil>;
}

export class Cluster extends EventEmitter {
  public constructor(manager: ClusterManager, id: number, shards: number[]);
  private _evals: Map<string, Promise<unknown>>;
  private _exitListener: (...args: any[]) => void;
  private _fetches: Map<string, Promise<unknown>>;
  private _handleExit(respawn?: boolean): void;
  private _handleMessage(message: unknown): void;

  public args: string[];
  public execArgv: string[];
  public env: unknown;
  public id: number;
  public manager: ClusterManager;
  public process: ChildProcess | null;
  public ready: boolean;
  public worker: Worker | null;
  public eval(script: string): Promise<unknown>;
  public eval<T>(fn: (client: Client) => T): Promise<T[]>;
  public fetchClientValue(prop: string): Promise<unknown>;
  public kill(): void;
  public respawn(options?: { delay?: number; timeout?: number }): Promise<ChildProcess>;
  public send(message: unknown): Promise<Cluster>;
  public spawn(timeout?: number): Promise<ChildProcess>;

  public on(event: 'spawn' | 'death', listener: (child: ChildProcess) => Awaited<void>): this;
  public on(event: 'disconnect' | 'ready' | 'reconnecting', listener: () => Awaited<void>): this;
  public on(event: 'error', listener: (error: Error) => Awaited<void>): this;
  public on(event: 'message', listener: (message: any) => Awaited<void>): this;
  public on(event: string, listener: (...args: any[]) => Awaited<void>): this;

  public once(event: 'spawn' | 'death', listener: (child: ChildProcess) => Awaited<void>): this;
  public once(event: 'disconnect' | 'ready' | 'reconnecting', listener: () => Awaited<void>): this;
  public once(event: 'error', listener: (error: Error) => Awaited<void>): this;
  public once(event: 'message', listener: (message: any) => Awaited<void>): this;
  public once(event: string, listener: (...args: any[]) => Awaited<void>): this;
}

export class ClusterClientUtil {
  public constructor(client: Client, mode: ClusterManagerMode);
  private _handleMessage(message: unknown): void;
  private _respond(type: string, message: unknown): void;

  public client: Client;
  public readonly count: number;
  public readonly id: number;
  public mode: ClusterManagerMode;
  public broadcastEval<T>(fn: (client: Client) => Awaited<T>): Promise<Serialized<T>[]>;
  public broadcastEval<T>(fn: (client: Client) => Awaited<T>, options: { shard: number }): Promise<Serialized<T>>;
  public broadcastEval<T, P>(
    fn: (client: Client, context: Serialized<P>) => Awaited<T>,
    options: { context: P },
  ): Promise<Serialized<T>[]>;
  public broadcastEval<T, P>(
    fn: (client: Client, context: Serialized<P>) => Awaited<T>,
    options: { context: P; shard: number },
  ): Promise<Serialized<T>>;
  public fetchClientValues<T = unknown>(prop: string): Promise<T[]>;
  public fetchClientValues<T = unknown>(prop: string, cluster: number): Promise<T>;
  public respawnAll(options?: MultipleClusterRespawnOptions): Promise<void>;
  public send(message: unknown): Promise<void>;

  public static singleton(client: Client, mode: ClusterManagerMode): ClusterClientUtil;
  public static shardIdForGuildId(guildId: Snowflake, shardCount: number): number;
}

export class ClusterManager extends EventEmitter {
  public constructor(file: string, options?: ClusterManagerOptions);
  private _performOnShards(method: string, args: unknown[]): Promise<unknown[]>;
  private _performOnShards(method: string, args: unknown[], shard: number): Promise<unknown>;

  public file: string;
  public respawn: boolean;
  public shardArgs: string[];
  public clusters: Collection<number, Cluster>;
  public token: string | null;
  public totalShards: number | 'auto';
  public shardList: number[] | 'auto';
  public broadcast(message: unknown): Promise<Cluster[]>;
  public broadcastEval<T>(fn: (client: Client) => Awaited<T>): Promise<Serialized<T>[]>;
  public broadcastEval<T>(fn: (client: Client) => Awaited<T>, options: { shard: number }): Promise<Serialized<T>>;
  public broadcastEval<T, P>(
    fn: (client: Client, context: Serialized<P>) => Awaited<T>,
    options: { context: P },
  ): Promise<Serialized<T>[]>;
  public broadcastEval<T, P>(
    fn: (client: Client, context: Serialized<P>) => Awaited<T>,
    options: { context: P; shard: number },
  ): Promise<Serialized<T>>;
  public createCluster(id: number): Cluster;
  public fetchClientValues(prop: string): Promise<unknown[]>;
  public fetchClientValues(prop: string, shard: number): Promise<unknown>;
  public respawnAll(options?: MultipleClusterRespawnOptions): Promise<Collection<number, Cluster>>;
  public spawn(options?: MultipleClusterSpawnOptions): Promise<Collection<number, Cluster>>;

  public on(event: 'clusterCreate', listener: (cluster: Cluster) => Awaited<void>): this;

  public once(event: 'clusterCreate', listener: (cluster: Cluster) => Awaited<void>): this;
}

export interface ClusterManagerOptions {
  totalClusters?: number | 'auto';
  totalShards?: number | 'auto';
  clusterList?: number[] | 'auto';
  shardList?: number[] | 'auto';
  guildsPerShard?: number;
  mode?: ShardingManagerMode;
  clusterRespawn?: boolean;
  shardRespawn?: boolean;
  shardArgs?: string[];
  token?: string;
  execArgv?: string[];
}

export type ClusterManagerMode = ShardingManagerMode;

export interface MultipleClusterRespawnOptions {
  clusterDelay?: number;
  respawnDelay?: number;
  timeout?: number;
}

export interface MultipleClusterSpawnOptions {
  clusters?: number | 'auto';
  shards?: number | 'auto';
  delay?: number;
  timeout?: number;
}

export interface ClusterClientOptions extends ClientOptions {
  logger?: boolean | {[k: string]: any};
}

export { ClientOptions, Shard, ShardClientUtil } from 'discord.js';
export { ChildProcess } from 'child_process';
export { Worker } from 'cluster';
