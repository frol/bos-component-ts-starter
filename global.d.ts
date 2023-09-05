declare interface BosContext {
  accountId?: string;
  networkId: NetworkId;
}

declare const Widget: (params: {
  src: string;
  props: object;
}) => React.ReactNode;
