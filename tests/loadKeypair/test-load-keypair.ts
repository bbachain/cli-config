import { expect } from "chai";
import { resolve } from "path";

import { BBAChainCliConfig } from "@";

describe("test cli config load keypair", () => {
  it("Can load keypair", () => {
    const cfg = BBAChainCliConfig.load(resolve(__dirname, "config.yml"));
    const kp = cfg.loadKeypair();
    expect(kp.publicKey.toString()).to.eq(
      "BjKxxk2ihiKVwTHxnLBS5y2VbKQAYTX6MRHzAdxMUpzp",
    );
  });
});
