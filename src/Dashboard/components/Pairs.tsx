import React from 'react';
import {useState,useEffect} from 'react';
import { StarIcon } from './StarIcon';
import { Market} from '../../types/trading';



interface PairProps {
market:Market
  favorites: Set<string>;
  isSelected?: boolean;
}

interface Details  {
   price:number,
   price_change_24h:number
}


const PRICE_TIMER_INTERVL = 10000;

export const Pairs: React.FC<PairProps> = ({
  market,
  favorites,
  isSelected
}) => {

  const [details,setDetails]= useState<Details>({
    price:0.0,
    price_change_24h:0.0
  })

  const updateDetails = async ()=> {
    try {
    const [response1,response2]= await Promise.all([fetchDetails(market.baseAsset.id),fetchDetails(market.quoteAsset.id)])

    const [baseAssetDetails,quoteAssetDetails]:Array<Details> = await Promise.all([response1.json(),response2.json()]);

    let price = baseAssetDetails.price/quoteAssetDetails.price

    let price_change_24h = ((baseAssetDetails.price_change_24h - quoteAssetDetails.price_change_24h) * 100 )/ (quoteAssetDetails.price_change_24h + 100)

    setDetails({price,price_change_24h})

    } catch (err){
      console.log(err)
    }
    
  }


  const fetchDetails= async (id:string)=> {
    const response =  fetch (`https://quotex-backend.onrender.com/api/price/${id}`);
    return  response
  }


  const formatPrice = (price: number) => {
    if (!price) return '0.00';
    return price < 1 ? price.toFixed(6) : price.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatPercent = (percent: number) => {
    if (!percent) return '0.00';
    return percent.toFixed(2);
  };

  useEffect(()=>{

    const intervalId = setInterval(()=>{
       updateDetails()
    },PRICE_TIMER_INTERVL)
 
    return ()=> {
      clearInterval(intervalId)
    }
  },[market])
  


  return (
    <div

      className={`flex items-center justify-between p-3 hover:bg-[#1C1C28] rounded-lg cursor-pointer group ${isSelected ? 'bg-[#1C1C28]' : ''
        }`}
    >
      <div className="flex items-center space-x-3">
        <button
          className="hover:scale-110 transition-transform"
          onClick={(e) => {
            e.stopPropagation();
          
          }}
        >
          <StarIcon filled={favorites?.has(market.baseAsset.id)} />
        </button>
        <img
          src={market.baseAsset.image}
          alt={market.baseAsset.symbol}
          className="w-6 h-6"
          // onError={(e) => {
          //   e.currentTarget.src = 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png';
          // }}
        />
        <div>
          <div className="font-medium">
            {market.baseAsset.symbol.toUpperCase()}/{market.quoteAsset.symbol.toUpperCase()}
          </div>
          <div className="text-sm text-gray-400">{market.baseAsset.symbol}</div>
        </div>
      </div>

      <div className="text-right">
        <div className="text-white font-medium">
          {formatPrice(details.price)} 
        </div>
        <div
          className={`text-sm ${details.price_change_24h <= 0 ? 'text-green-500' : 'text-red-500'
            }`}
        >
          {formatPercent(details.price_change_24h)}%
        </div>
      </div>
    </div>
  );
};
