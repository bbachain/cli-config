import { expect } from "chai";
import { existsSync } from "fs";

import { BBAChainCliConfig } from "@";

describe("test cli config default", () => {
  it("Correct default", () => {
    const def = BBAChainCliConfig.default();
    expect(def.jsonRpcUrl).to.eq("https://api-mainnet.bbachain.com");
    expect(def.websocketUrl).to.eq("wss://api-mainnet.bbachain.com/");
    expect(def.keypairPath).to.eq("~/.bbachain/id.json");
    expect(def.addressLabels.size).to.eq(1);
    expect(def.addressLabels.get("11111111111111111111111111111111")).to.eq(
      "System Program",
    );
    expect(def.commitment).to.eq("confirmed");
  });

  it("Can load default path", () => {
    if (!existsSync(BBAChainCliConfig.DEFAULT_PATH)) {
      console.log(
        BBAChainCliConfig.DEFAULT_PATH,
        "file does not exist, skipping",
      );
      return;
    }
    // no errors should be thrown
    BBAChainCliConfig.load();
  });
});
