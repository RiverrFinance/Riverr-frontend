import { useAgent, useAuth } from "@nfid/identitykit/react";
import { ICP_API_HOST } from "../../utils/utilFunction";
import { Asset, assetList } from "../../lists/marketlist";
import { VaultActor } from "../../utils/Interfaces/vaultActor";
import React, { useEffect, useState } from "react";
import { HttpAgent } from "@dfinity/agent";
import { parseUnits } from "ethers/lib/utils";

export const Earn = () => {
  const readWriteAgent = useAgent();
  const [readAgent, setReadAgent] = useState<HttpAgent>(HttpAgent.createSync());

  useEffect(() => {
    HttpAgent.create({ host: ICP_API_HOST, retryTimes: 1 }).then(setReadAgent);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-4">Earn</h1> []
    </div>
  );
};
