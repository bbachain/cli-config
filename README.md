# BBAChain CLI Config

Typescript bindings for BBAChain CLI config (originally in rust).

No browser, intended for use in node.js based bbachain CLI applications.

## Example Usage

```ts
import { Connection, Keypair } from "@bbachain/web3.js";
import { BBAChainCliConfig } from "@bbachain/cli-config"

// Load the bbachain CLI config file from the default path ($HOME/.bbachain/cli/config.yml)
const config = BBAChainCliConfig.load();

// Load the keypair from the file path specified in the config file
const keypair: Keypair = config.loadKeypair();

// Create a `Connection` object from the config
const connection: Connection = config.createConnection();
```