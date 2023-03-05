import { Interface } from '@ethersproject/abi'
import STAKING_REWARDS_ABI from '../../constants/abis/ahp/POOL_STAKING.json'
import VELT_ABI from '../../constants/abis/ahp/VELT_TOKEN.json'
import { abi as STAKING_REWARDS_FACTORY_ABI } from '@uniswap/liquidity-staker/build/StakingRewardsFactory.json'

const STAKING_REWARDS_INTERFACE = new Interface(STAKING_REWARDS_ABI)

const VELT_INTERFACE = new Interface(VELT_ABI.abi)

const STAKING_REWARDS_FACTORY_INTERFACE = new Interface(STAKING_REWARDS_FACTORY_ABI)

export { STAKING_REWARDS_FACTORY_INTERFACE, STAKING_REWARDS_INTERFACE, VELT_INTERFACE }
