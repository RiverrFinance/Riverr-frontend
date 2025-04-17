export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    'mint' : IDL.Func([IDL.Principal, IDL.Principal, IDL.Nat], [IDL.Bool], []),
  });
};
export const init = ({ IDL }) => { return []; };
