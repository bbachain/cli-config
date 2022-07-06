import { expect } from "chai";
import { existsSync } from "fs";

import { SolanaCliConfig } from "@";

describe("test cli config default", () => {
  it("Correct default", () => {
    const def = SolanaCliConfig.default();
    expect(def.jsonRpcUrl).to.eq("https://api.mainnet-beta.solana.com");
    expect(def.websocketUrl).to.eq("wss://api.mainnet-beta.solana.com/");
    expect(def.keypairPath).to.eq("~/.config/solana/id.json");
    expect(def.addressLabels.size).to.eq(1);
    expect(def.addressLabels.get("11111111111111111111111111111111")).to.eq(
      "System Program",
    );
    expect(def.commitment).to.eq("confirmed");
  });

  it("Can load default path", () => {
    if (!existsSync(SolanaCliConfig.DEFAULT_PATH)) {
      console.log(
        SolanaCliConfig.DEFAULT_PATH,
        "file does not exist, skipping",
      );
      return;
    }
    // no errors should be thrown
    SolanaCliConfig.load();
  });
});
