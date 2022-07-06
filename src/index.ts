import type { Commitment } from "@solana/web3.js";
import { Connection, Keypair } from "@solana/web3.js";
import { readFileSync, writeFileSync } from "fs";
import { parse, stringify } from "yaml";

/**
 * The raw config loaded from the yaml file
 */
export type SolanaCliConfigRaw = {
  json_rpc_url: string;
  websocket_url: string;
  keypair_path: string;
  address_labels: { [address in string]: string };
  commitment: Commitment;
};

export const SOLANA_CLI_CONFIG_RAW_DEFAULT: SolanaCliConfigRaw = {
  json_rpc_url: "https://api.mainnet-beta.solana.com",
  websocket_url: "",
  keypair_path: "~/.config/solana/id.json",
  address_labels: {
    "11111111111111111111111111111111": "System Program",
  },
  commitment: "confirmed",
};

function deriveWebsocketUrl(jsonRpcUrl: URL): URL {
  const protocol = jsonRpcUrl.protocol === "http:" ? "ws:" : "wss:";
  const portString = jsonRpcUrl.port ? `:${Number(jsonRpcUrl.port) + 1}` : "";
  return new URL(`${protocol}//${jsonRpcUrl.hostname}${portString}/`);
}

function isDerivedWebsocketUrl(jsonRpcUrl: URL, websocketUrl: URL): boolean {
  const portMatches =
    (!jsonRpcUrl.port && jsonRpcUrl.port === websocketUrl.port) ||
    (!!jsonRpcUrl.port &&
      Number(jsonRpcUrl.port) + 1 === Number(websocketUrl.port));
  return jsonRpcUrl.hostname === websocketUrl.hostname && portMatches;
}

export class SolanaCliConfig {
  public static DEFAULT_PATH: string = "~/.config/solana/cli/config.yml";

  private _jsonRpcUrl: URL;

  private _websocketUrl: URL;

  public keypairPath: string;

  public addressLabels: Map<string, string>;

  public commitment: Commitment;

  get jsonRpcUrl(): string {
    // omits trailing slash
    return this._jsonRpcUrl.origin;
  }

  get websocketUrl(): string {
    // includes trailing slash
    return this._websocketUrl.href;
  }

  constructor({
    json_rpc_url,
    websocket_url,
    keypair_path,
    address_labels,
    commitment,
  }: SolanaCliConfigRaw) {
    this._jsonRpcUrl = new URL(json_rpc_url);
    this._websocketUrl = websocket_url
      ? new URL(websocket_url)
      : deriveWebsocketUrl(this._jsonRpcUrl);
    this.keypairPath = keypair_path;
    this.commitment = commitment;
    this.addressLabels = new Map(Object.entries(address_labels));
  }

  static default(): SolanaCliConfig {
    return new SolanaCliConfig(SOLANA_CLI_CONFIG_RAW_DEFAULT);
  }

  static load(path: string = SolanaCliConfig.DEFAULT_PATH): SolanaCliConfig {
    const raw = parse(
      readFileSync(path, { encoding: "utf-8" }),
    ) as SolanaCliConfigRaw;
    return new SolanaCliConfig(raw);
  }

  toRaw(): SolanaCliConfigRaw {
    return {
      json_rpc_url: this.jsonRpcUrl,
      websocket_url: isDerivedWebsocketUrl(this._jsonRpcUrl, this._websocketUrl)
        ? ""
        : this.websocketUrl,
      keypair_path: this.keypairPath,
      address_labels: Object.fromEntries(this.addressLabels),
      commitment: this.commitment,
    };
  }

  save(path: string = SolanaCliConfig.DEFAULT_PATH): void {
    const raw = this.toRaw();
    writeFileSync(path, stringify(raw));
  }

  loadKeypair(): Keypair {
    return Keypair.fromSecretKey(
      Buffer.from(
        JSON.parse(
          readFileSync(this.keypairPath, { encoding: "utf-8" }),
        ) as number[],
      ),
    );
  }

  createConnection(): Connection {
    return new Connection(this.jsonRpcUrl, {
      commitment: this.commitment,
      wsEndpoint: this.websocketUrl,
    });
  }
}
