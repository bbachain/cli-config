import { expect } from "chai";
import { readFileSync } from "fs";
import { resolve } from "path";

import { SolanaCliConfig } from "@";

type ConfigPaths = {
  loadPath: string;
  savePath: string;
};

function configPaths(name: string): ConfigPaths {
  return {
    loadPath: resolve(__dirname, `${name}.yml`),
    savePath: resolve(__dirname, `save${name}.yml`),
  };
}

function checkSavedFileEq({ loadPath, savePath }: ConfigPaths): void {
  const loadContents = readFileSync(loadPath, { encoding: "utf-8" });
  const saveContents = readFileSync(savePath, { encoding: "utf-8" });
  expect(loadContents).to.be.eq(saveContents);
}

describe("test cli config file loading and saving", () => {
  it("Can load and save a derived wss websocket path with no ports", () => {
    const paths = configPaths("deriveWsHttpsNoPort");
    const { loadPath, savePath } = paths;
    const cfg = SolanaCliConfig.load(loadPath);
    expect(cfg.websocketUrl).to.eq("wss://api.devnet.solana.com/");
    cfg.save(savePath, true);
    checkSavedFileEq(paths);
  });

  it("Can load and save a derived wss websocket path with ports", () => {
    const paths = configPaths("deriveWsHttpsPort");
    const { loadPath, savePath } = paths;
    const cfg = SolanaCliConfig.load(loadPath);
    expect(cfg.websocketUrl).to.eq("wss://api.devnet.solana.com:8900/");
    cfg.save(savePath, true);
    checkSavedFileEq(paths);
  });

  it("Can load and save a derived ws websocket path with no ports", () => {
    const paths = configPaths("deriveWsHttpNoPort");
    const { loadPath, savePath } = paths;
    const cfg = SolanaCliConfig.load(loadPath);
    expect(cfg.websocketUrl).to.eq("ws://api.devnet.solana.com/");
    cfg.save(savePath, true);
    checkSavedFileEq(paths);
  });

  it("Can load and save a derived ws websocket path with ports", () => {
    const paths = configPaths("deriveWsHttpPort");
    const { loadPath, savePath } = paths;
    const cfg = SolanaCliConfig.load(loadPath);
    expect(cfg.websocketUrl).to.eq("ws://localhost:8900/");
    cfg.save(savePath, true);
    checkSavedFileEq(paths);
  });

  it("Can load and save a non-derived wss websocket path", () => {
    const paths = configPaths("noDeriveWsHttps");
    const { loadPath, savePath } = paths;
    const cfg = SolanaCliConfig.load(loadPath);
    cfg.save(savePath, true);
    checkSavedFileEq(paths);
  });

  it("Can load and save a non-derived ws websocket path", () => {
    const paths = configPaths("noDeriveWsHttp");
    const { loadPath, savePath } = paths;
    const cfg = SolanaCliConfig.load(loadPath);
    cfg.save(savePath, true);
    checkSavedFileEq(paths);
  });

  it("Does not overwrite when overwrite is false", () => {
    const cfg = SolanaCliConfig.default();
    expect(() => cfg.save(resolve(__dirname, "dontOverwriteMe.yml"))).to.throw(
      "file already exists",
    );
  });
});
