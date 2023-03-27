import { useEffect } from 'react';
import { useActiveWeb3React } from "hooks";

export default function useLogout(reset: () => void) {
  const { account } = useActiveWeb3React()

  useEffect(() => {
    if(!account) {
      reset()
    }
  }, [account])
}