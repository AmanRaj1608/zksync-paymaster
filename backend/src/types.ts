export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export interface Database {
  public: {
    Tables: {
      paymaster_transactions: {
        Row: {
          id: string;
          user: string;
          token: string;
          amount: string;
          requiredETH: string;
          gasLimit: string;
          maxFeePerGas: string;
          blockNumber: string;
          blockTimestamp: string;
          transactionHash: string;
        };
        Insert: {
          id: string;
          user: string;
          token: string;
          amount: string;
          requiredETH: string;
          gasLimit: string;
          maxFeePerGas: string;
          blockNumber: string;
          blockTimestamp: string;
          transactionHash: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["paymaster_transactions"]["Insert"]
        >;
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
