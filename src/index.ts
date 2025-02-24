import type { Commitment } from "@bbachain/web3.js";
import { Connection, Keypair } from "@bbachain/web3.js";
import { readFileSync, writeFileSync } from "fs";
import { homedir } from "os";
import { parse, stringify } from "yaml";

/**
 * The raw config loaded from the yaml file
 */
export type BBAChainCliConfigRaw = {
  json_rpc_url: string;
  websocket_url: string;
  keypair_path: string;
  address_labels: { [address in string]: string };
  commitment: Commitment;
};

export const BBACHAIN_CLI_CONFIG_RAW_DEFAULT: BBAChainCliConfigRaw = {
  json_rpc_url: "https://api-mainnet.bbachain.com",
  websocket_url: "",
  keypair_path: "~/.bbachain/id.json",
  address_labels: {
    "11111111111111111111111111111111": "System Program",
  },
  commitment: "confirmed",
};

function deriveWebsocketUrl(jsonRpcUrl: string): string {
  const url = new URL(jsonRpcUrl);
  const protocol = url.protocol === "http:" ? "ws:" : "wss:";
  const portString = url.port ? `:${Number(url.port) + 1}` : "";
  // Note trailing / (IMPORTANT)
  return `${protocol}//${url.hostname}${portString}/`;
}

function isDerivedWebsocketUrl(
  jsonRpcUrl: string,
  websocketUrl: string,
): boolean {
  return deriveWebsocketUrl(jsonRpcUrl) === websocketUrl;
}

export class BBAChainCliConfig {
  public static DEFAULT_PATH: string = `${homedir()}/.bbachain/cli/config.yml`;

  public keypairPath: string;

  public addressLabels: Map<string, string>;

  public commitment: Commitment;

  public jsonRpcUrl: string;

  public websocketUrl: string;

  constructor({
    json_rpc_url,
    websocket_url,
    keypair_path,
    address_labels,
    commitment,
  }: BBAChainCliConfigRaw) {
    this.jsonRpcUrl = json_rpc_url;
    this.websocketUrl = websocket_url || deriveWebsocketUrl(this.jsonRpcUrl);
    this.keypairPath = keypair_path;
    this.commitment = commitment;
    this.addressLabels = new Map(Object.entries(address_labels));
  }

  static default(): BBAChainCliConfig {
    return new BBAChainCliConfig(BBACHAIN_CLI_CONFIG_RAW_DEFAULT);
  }

  static load(
    path: string = BBAChainCliConfig.DEFAULT_PATH,
  ): BBAChainCliConfig {
    const raw = parse(
      readFileSync(path, { encoding: "utf-8" }),
    ) as BBAChainCliConfigRaw;
    return new BBAChainCliConfig(raw);
  }

  toRaw(): BBAChainCliConfigRaw {
    return {
      json_rpc_url: this.jsonRpcUrl,
      websocket_url: isDerivedWebsocketUrl(this.jsonRpcUrl, this.websocketUrl)
        ? ""
        : this.websocketUrl,
      keypair_path: this.keypairPath,
      address_labels: Object.fromEntries(this.addressLabels),
      commitment: this.commitment,
    };
  }

  save(
    path: string = BBAChainCliConfig.DEFAULT_PATH,
    overwrite: boolean = false,
  ): void {
    const raw = this.toRaw();
    // directives true to include yaml start-of-doc `---`
    writeFileSync(path, stringify(raw, { directives: true }), {
      encoding: "utf-8",
      flag: overwrite ? "w" : "wx",
    });
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
