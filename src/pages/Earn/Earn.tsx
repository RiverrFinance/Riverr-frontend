import { useAgent, useAuth } from "@nfid/identitykit/react";
import { ICP_API_HOST } from "../../utils/utilFunction";
import { Asset, assetList } from "../../lists/marketlist";
import { VaultActor } from "../../utils/Interfaces/vaultActor";
import React, { useEffect, useState } from "react";
import { HttpAgent } from "@dfinity/agent";
import { parseUnits } from "ethers/lib/utils";

export const Earn = () => {
  const readWriteAgent = useAgent();
  const { user } = useAuth();
  const [selectedAsset, setSelectedAsset] = useState(assetList[0]);

  const [readAgent, setReadAgent] = useState<HttpAgent>(HttpAgent.createSync());
  const [amounToProvide, setAmountToProvide] = useState<string>("");
  const [useMarginBalance, setUsermarginBalance] = useState<bigint>(0n);

  useEffect(() => {
    HttpAgent.create({ host: ICP_API_HOST }).then(setReadAgent);
  }, []);

  useEffect(() => {
    HttpAgent.create({ host: ICP_API_HOST }).then(setReadAgent);
  }, []);
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-4">Earn</h1> []
    </div>
  );
};
