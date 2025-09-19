// import { formatUnits, parseUnits } from "ethers/lib/utils";
// import {
//   MarketState,
//   MarketDetails,
// } from "../../utils/declarations/clearing_house/clearing_house.did";

// const PRECISION: bigint = 20n;
// class MarketDetailQuery {
//   marketDetails: MarketDetails;
//   constructor(details: MarketDetails) {
//     this.marketDetails = details;
//   }

//   public nextcurrentFundingFactor(): String {
//     return formatUnits(
//       this.marketDetails.funding_manager.next_funding_factor_ps,
//       PRECISION
//     );
//   }

//   public nextBorrowingfactor(long: boolean): string {
//     let factor = long
//       ? formatUnits(
//           this.marketDetails.bias_tracker.longs.current_borrowing_factor,
//           PRECISION
//         )
//       : formatUnits(
//           this.marketDetails.bias_tracker.shorts.current_borrowing_factor,
//           PRECISION
//         );

//     return factor;
//   }

//   public remainingReserveForBias(long: boolean): bigint {
//     let {
//       current_longs_reserve,
//       longs_max_reserve_factor,
//       shorts_max_reserve_factor,
//       current_shorts_reserve,
//       current_net_debt,
//       current_borrow_fees_owed,
//       bad_debt,
//     } = this.marketDetails.liquidity_manager;

//     let calcvalue =
//       current_longs_reserve +
//       current_shorts_reserve +
//       current_net_debt +
//       current_borrow_fees_owed -
//       bad_debt;

//     let netAvailableLiquiidtyProvided = calcvalue > 0n ? calcvalue : 0n;

//     let factor = long ? longs_max_reserve_factor : shorts_max_reserve_factor;

//     let used_reserve = long ? current_longs_reserve : current_shorts_reserve;

//     let reserveForBais =
//       (netAvailableLiquiidtyProvided * factor) / (10n ^ PRECISION);

//     if (reserveForBais > current_longs_reserve) {
//       return reserveForBais - used_reserve;
//     } else {
//       return 0n;
//     }
//   }

//   public timeRemainingForFundingFeesCollection() {
//     let lastUpdatedTime = this.marketDetails.funding_manager.last_time_updated;
//     return timeRemaining(lastUpdatedTime);
//   }

//   public availableLiquidity() {
//     return this.marketDetails.liquidity_manager.free_liquidity;
//   }
// }

// const timeRemaining = (lastTimeInNanos: bigint): string => {
//   let lastTime = Number(lastTimeInNanos / 1000000n);
//   let currentTime: number = Date.now();

//   return formatDuration(lastTime - currentTime);
// };

// const formatDuration = (ms: number): string => {
//   // If milliseconds are negative, convert them to positive
//   if (ms < 0) ms = -ms;
//   // Define an object 'time' to store the duration components
//   const time = {
//     day: Math.floor(ms / 86400000), // Calculate number of days
//     hour: Math.floor(ms / 3600000) % 24, // Calculate number of hours (mod 24 to get the remaining hours)
//     minute: Math.floor(ms / 60000) % 60,
//     // Calculate number of milliseconds (mod 1000 to get the remaining milliseconds)
//   };
//   // Convert the 'time' object to an array of key-value pairs, filter out components with a value of 0, and format each component
//   return Object.entries(time)
//     .filter((val) => val[1] !== 0) // Filter out components with a value of 0
//     .map((val) => val[1] + " " + (val[1] !== 1 ? val[0] + "s" : val[0])) // Format each component
//     .join(", "); // Join the formatted components with a comma and space
// };
