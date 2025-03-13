import React, { useEffect, useState } from 'react';
import { Icon } from 'semantic-ui-react';
import { TradingPanelProps} from '../../types/trading';
import { MarketActor } from '../../utils/Interfaces/marketActor';
import { AnonymousIdentity, HttpAgent } from '@dfinity/agent';
import { StakeDetails } from '../../utils/declarations/vault/vault.did';
import { StateDetails } from '../../utils/declarations/market/market.did';
import { TokenActor } from '../../utils/Interfaces/tokenActor';


//@ts-ignore
if (typeof global === 'undefined') {
  (window as any).global = window;
}

type Parameters ={
  collateral:number,
  leverage:number,
  limitPrice:number
}


export const TradingPanel: React.FC<TradingPanelProps> = ({market,identity}) => {
  const [orderType,setOrderType] =useState<'Market' | 'Limit'>('Market');
  const [activeTab, setActiveTab] = useState<'Long' | 'Short'>('Long');
 const  [paramters,setParamters] = useState<Parameters>(
{collateral:0,
  leverage:1,
  limitPrice:0
})

const [marketState,setMarketState]= useState<StateDetails>({

      max_leveragex10 :100,
      not_paused : true,
      current_tick : 0n,
      base_token_multiple : 20,
      min_collateral :0n,
})
 

 const openOrder = async ()=> {
    try {
      if (identity){
        let agent = await HttpAgent.create({identity})

        let long = activeTab == "Long";

        let order = orderType == "Limit"? { 'Limit' : null } :
        { 'Market' : null };

        let marketactor = new MarketActor(market.market_id,agent);

        let result =await  marketactor.openPosition(BigInt(paramters.collateral),long,order,paramters.leverage,[]);

        console.log(result)
      }
   
    }catch {

    }
 }

 const fetchAndSetStatezDetails =async ()=> {
  try {
    
      let agent = await  HttpAgent.create({
        host:"https://ic0.app",
        identity:new AnonymousIdentity()
      }) 

      let marketActor = new MarketActor(market.market_id,agent);

      let details = await marketActor.getStateDetails()

      setMarketState(details)
 
  }catch(e) {
    
  }
     
 }

 useEffect(()=>{
  const interval = setInterval(()=>{
  fetchAndSetStatezDetails()
  
  })

  return ()=>{
    clearInterval(interval)
  }

 
 },[])


  return (
    <div className={`bg-[#13131F] p-3 rounded-lg border border-gray-800`}>
           <div className="flex p-1 mb-5 mx-3">
        {(['Market', 'Limit'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setOrderType(type)}
            className={`flex-1 py-2 px-4 text-sm font-medium transition-all duration-200 
              ${orderType === type
                ? 'text-blue-500 font-medium text-md border-b border-b-blue-500 px-4 py-1 transition-all duration-200'
                : 'text-gray-400 hover:text-white transition-colors duration-200 text-md'}`}
          >
            {type}
          </button>
        ))}
      </div>
      {/* Trading Type Selector */}
      <div className="flex p-1 bg-[#1C1C28] p-1 mx-4 border border-gray-700 rounded-md ">
        {(['Long', 'Short'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setActiveTab(type)}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 
              ${activeTab === type
                ? 'text-gray-900 font-medium text-md bg-blue-500 rounded-md px-4 py-1 transition-all duration-200'
                : 'text-white transition-colors duration-200 text-md'}`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-4">
        {/* Pay Input */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Collateral</span>
            <span className="text-gray-400">
              Available: {10}{"USDT"}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-[#1C1C28] rounded-lg p-3">
            <input
              type="number"
              value={paramters.collateral}
              onChange={(e) =>  {
                let {value} = e.target
               setParamters( {
                ...paramters,
                  collateral:value == ""?0:Number(value),
                  limitPrice:value == ""?0:Number(value) * paramters.leverage
                  
                }) 
              }}
              className="flex-1 bg-transparent text-white outline-none text-lg"
              placeholder="0.00"
            />
            <div>{market.quoteAsset.symbol}</div>
          </div>
        </div>

        {/* Receive Input */}

       {orderType =="Limit"?<div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">{activeTab}</span>
          </div>
          <div className="flex items-center gap-2 bg-[#1C1C28] rounded-lg p-3">
            <input
              type="number"
              value={paramters.limitPrice}
              onChange={(e) => {
                let {value} = e.target;

                setParamters( {
                  ...paramters,
                    limitPrice:value == ""?0:Number(value),
                    collateral :value == ""?0:Number(value)/paramters.leverage
                    
                  }) 
              }}
              className="flex-1 bg-transparent text-white outline-none text-lg"
              placeholder="0.00"
            />
            <div
              className="bg-[#1C1C28] text-white outline-none px-2 py-1 rounded"
            >{activeTab == "Long"?market.quoteAsset.symbol:market.baseAsset.symbol}
            </div>
          </div>
        </div>:<></>}

        {/* Leverage Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Leverage</span>
            <span className="text-white font-medium">{paramters.leverage}x</span>
          </div>
          <div className="relative">
            <input
              type="range"
              min="1"
              max={100}
              value={paramters.leverage}
              onChange={(e) => {
                let {value} = e.target;

                setParamters( {
                  ...paramters,
                    leverage: Number(value),
                    limitPrice:paramters.collateral * Number(value)
                    
                  }) 
              }}
              className="w-full h-1 bg-[#1C1C28] rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center bg-[#1C1C28] rounded-lg p-3">
          <span className="text-gray-400">Total</span>
          <span className="text-white">30,211.85 USDT</span>
        </div>

        {/* Pool Selection */}
        <div className="flex justify-between items-center bg-[#1C1C28] rounded-lg p-3">
          <span className="text-gray-400">Pool</span>
          <div className="flex items-center gap-2">
            <span className="text-white">{market.baseAsset.symbol}-{market.quoteAsset.symbol}</span>
            <Icon name="chevron down" className="text-gray-400" />
          </div>
        </div>

        {/* Styled ConnectWalletButton */}
        <div className=" flex justify-center">
        {/* <button onClick={stateDetails}>test it now </button> */}
          {/* <ConnectWalletButton
            className="py-3 px-24"
            isConnected={false}
            isIconConnected={false}
          /> */}
        </div>
      </div>
    </div>
  );
}; 