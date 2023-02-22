[toc]



# PortfolioController

PortfolioController



## User  HOPE overview

> BASIC

**Path:** /v1/light/portfolio/gomboc/overview

**Method:** GET

> REQUEST

**Query:**

| name | value | required | desc |
| ------------ | ------------ | ------------ | ------------ |
| userWalletAddress |  | NO |  |



> RESPONSE

**Headers:**

| name | value | required | desc |
| ------------ | ------------ | ------------ | ------------ |
| content-type | application/json;charset=UTF-8 | NO |  |

**Body:**

| name | type | desc |
| ------------ | ------------ | ------------ |
| code | integer |  |
| message | string |  |
| result | object |  |
| &ensp;&ensp;&#124;─hope | number | HOPE 数量为地址当前持有的可以随时使用的 HOPE 余额估值； |
| &ensp;&ensp;&#124;─usdOfHope | number |  |
| &ensp;&ensp;&#124;─stHope | number | stHOPE 数量为地址当前持有的可以随时使用的 stHOPE余额估值； |
| &ensp;&ensp;&#124;─hopeOfStHope | number |  |
| &ensp;&ensp;&#124;─hopeOfPool | number | Pool 数量为地址当前未质押的所有流动性代币总的可以赎回的资产估值；<br>       例如：1个 LT-HOPE LP Token 可以赎回 100.00 个 LT + 15.00 个HOPE （含fee), 那么估值就是 LT Price * 100.00 + HOPE Price * 15.00; |
| &ensp;&ensp;&#124;─hopeOfFarming | number | Farming 数量为所有已经质押的 LP Token 的总价值 + 所有 Claimable Rewards 的总价值； |
| &ensp;&ensp;&#124;─hopeOfGovern | number | Govern 数量为地址为获得 veLT 而锁定的 LT 数量的总价值； |
| &ensp;&ensp;&#124;─hopeOfLt | number | LT 数量为地址当前持有的可以随时使用的 LT 余额估值； |
| &ensp;&ensp;&#124;─rewards | array |  |
| &ensp;&ensp;&ensp;&ensp;&#124;─ | object |  |
| &ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&#124;─name | string | gomboc name |
| &ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&#124;─gomboc | string | gomboc address |
| &ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&#124;─apr | number | APR 列： 展示当前 Gömböc 每日 UTC 0 点更新得到的 APR 收益率；同时展示当下用户的 基础收益率倍数 和 最大可提升的收益率倍数<br>The APR (USD denominated) is calculated using token prices denominated in USD.<br>Prices are fetched either from HopeSwap pools.<br>Also, the APR is a 365 day projection based on each pool's performance over the last 24h.<br>See Hope Ecosystem Disclaimers & Disclosures for more details |
| &ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&#124;─boost | string | 当前boost |
| &ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&#124;─maxBoost | string | 最大 boost |
| &ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&#124;─staked | integer | 展示地址当前质押到 Gömböc 中的对应的 LP Token 的数量；同时展示质押数量的资产估值。<br>例如：1个 LT-HOPE LP Token 可以赎回 100.00 个 LT + 15.00 个HOPE （含fee), 那么估值就是 LT Price * 100.00 + HOPE Price * 15.00; |
| &ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&#124;─usdOfStaked | number |  |
| &ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&#124;─stakeable | integer | Stakeable 列： 展示地址当前可以用于质押的 LP Token 的数量； 同时展示资产估值。<br>     例如：1个 LT-HOPE LP Token 可以赎回 100.00 个 LT + 15.00 个HOPE （含fee), 那么估值就是 LT Price * 100.00 + HOPE Price * 15.00; |
| &ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&#124;─usdOfStakeable | number |  |
| &ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&#124;─stakeSymbol | string | 质押单位 LP HOPE |
| &ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&#124;─reward | integer | Reward 列：展示地址当前在对应的 Gömböc 可以提取的奖励资产数量，目前所有奖励资产均为 LT；同时展示可提取资产的估值。 |
| &ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&#124;─usdOfReward | number |  |
| &ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&#124;─rewardSymbol | string | 奖励单位LT |

**Response Demo:**

```json
{
  "code": 0,
  "message": "",
  "result": {
    "hope": 0.0,
    "usdOfHope": 0.0,
    "stHope": 0.0,
    "hopeOfStHope": 0.0,
    "hopeOfPool": 0.0,
    "hopeOfFarming": 0.0,
    "hopeOfGovern": 0.0,
    "hopeOfLt": 0.0,
    "rewards": [
      {
        "name": "",
        "gomboc": "",
        "apr": 0.0,
        "boost": "",
        "maxBoost": "",
        "staked": 0,
        "usdOfStaked": 0.0,
        "stakeable": 0,
        "usdOfStakeable": 0.0,
        "stakeSymbol": "",
        "reward": 0,
        "usdOfReward": 0.0,
        "rewardSymbol": ""
      }
    ]
  }
}
```







# Base Api

Base Api


---
## Token List(whitelist coin)

> BASIC

**Path:** /v1/light/dao/base/getAllCoins

**Method:** GET

> REQUEST

**Query:**

| name | value | required | desc |
| ------------ | ------------ | ------------ | ------------ |
| chainId |  | NO |  |



> RESPONSE

**Headers:**

| name | value | required | desc |
| ------------ | ------------ | ------------ | ------------ |
| content-type | application/json;charset=UTF-8 | NO |  |

**Body:**

| name | type | desc |
| ------------ | ------------ | ------------ |
| code | integer |  |
| message | string |  |
| result | array |  |
| &ensp;&ensp;&#124;─ | object |  |
| &ensp;&ensp;&ensp;&ensp;&#124;─chainId | integer |  |
| &ensp;&ensp;&ensp;&ensp;&#124;─address | string |  |
| &ensp;&ensp;&ensp;&ensp;&#124;─name | string |  |
| &ensp;&ensp;&ensp;&ensp;&#124;─symbol | string |  |
| &ensp;&ensp;&ensp;&ensp;&#124;─decimals | integer |  |
| &ensp;&ensp;&ensp;&ensp;&#124;─logoURI | string |  |

**Response Demo:**

```json
{
  "code": 0,
  "message": "",
  "result": [
    {
      "chainId": 0,
      "address": "",
      "name": "",
      "symbol": "",
      "decimals": 0,
      "logoURI": ""
    }
  ]
}
```




---
## ~~Token Price~~

> BASIC

**Path:** /v1/light/dao/base/coin/price

**Method:** GET

> REQUEST

**Query:**

| name | value | required | desc |
| ------------ | ------------ | ------------ | ------------ |
| fromAddress |  | YES |  |
| toAddress |  | YES |  |



> RESPONSE

**Headers:**

| name | value | required | desc |
| ------------ | ------------ | ------------ | ------------ |
| content-type | application/json;charset=UTF-8 | NO |  |

**Body:**

| name | type | desc |
| ------------ | ------------ | ------------ |
| code | integer |  |
| message | string |  |
| result | number |  |

**Response Demo:**

```json
{
  "code": 0,
  "message": "",
  "result": 0.0
}
```




---
## ~~Toekn of USD~~

> BASIC

**Path:** /v1/light/dao/base/coin/usdPrice

**Method:** GET

> REQUEST

**Query:**

| name | value | required | desc |
| ------------ | ------------ | ------------ | ------------ |
| symbol |  | YES |  |



> RESPONSE

**Headers:**

| name | value | required | desc |
| ------------ | ------------ | ------------ | ------------ |
| content-type | application/json;charset=UTF-8 | NO |  |

**Body:**

| name | type | desc |
| ------------ | ------------ | ------------ |
| code | integer |  |
| message | string |  |
| result | number |  |

**Response Demo:**

```json
{
  "code": 0,
  "message": "",
  "result": 0.0
}
```




---
## Gas Fee

> BASIC

**Path:** /v1/light/dao/base/getGas

**Method:** GET

**Desc:**

 参考是Curive的数据 https://classic.curve.fi/

> REQUEST



> RESPONSE

**Headers:**

| name | value | required | desc |
| ------------ | ------------ | ------------ | ------------ |
| content-type | application/json;charset=UTF-8 | NO |  |

**Body:**

| name | type | desc |
| ------------ | ------------ | ------------ |
| code | integer |  |
| message | string |  |
| result | object |  |
| &ensp;&ensp;&#124;─gas | object |  |
| &ensp;&ensp;&ensp;&ensp;&#124;─rapid | integer |  |
| &ensp;&ensp;&ensp;&ensp;&#124;─fast | integer |  |
| &ensp;&ensp;&ensp;&ensp;&#124;─standard | integer |  |
| &ensp;&ensp;&ensp;&ensp;&#124;─slow | integer |  |
| &ensp;&ensp;&#124;─eip1559Gas | object |  |
| &ensp;&ensp;&ensp;&ensp;&#124;─base | integer |  |
| &ensp;&ensp;&ensp;&ensp;&#124;─prio | array |  |
| &ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&#124;─ | integer |  |
| &ensp;&ensp;&ensp;&ensp;&#124;─max | array |  |
| &ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&#124;─ | integer |  |

**Response Demo:**

```json
{
  "code": 0,
  "message": "",
  "result": {
    "gas": {
      "rapid": 0,
      "fast": 0,
      "standard": 0,
      "slow": 0
    },
    "eip1559Gas": {
      "base": 0,
      "prio": [
        0
      ],
      "max": [
        0
      ]
    }
  }
}
```




# Swap Support Server API

Swap Support Server API


---
## ~~Swap Pool Overview~~

> BASIC

**Path:** /v1/light/dao/swap/overview

**Method:** GET

> REQUEST



> RESPONSE

**Headers:**

| name | value | required | desc |
| ------------ | ------------ | ------------ | ------------ |
| content-type | application/json;charset=UTF-8 | NO |  |

**Body:**

| name | type | desc |
| ------------ | ------------ | ------------ |
| code | integer |  |
| message | string |  |
| result | object |  |
| &ensp;&ensp;&#124;─totalUsdOfTvl | number | 当前TVL 估值(锁定的总价值) |
| &ensp;&ensp;&#124;─changeOfTotalUsdOfTvl | number | 涨跌幅(当前TVL 估值) |
| &ensp;&ensp;&#124;─totalUsdVolume | number | 24交易量 |
| &ensp;&ensp;&#124;─changeOfTotalUsdVolume | number | 涨跌幅(24交易量) |
| &ensp;&ensp;&#124;─total24HourUsdFees | number | 24小时交易手续费 |
| &ensp;&ensp;&#124;─changeOfTotal24HourUsdFees | number | 涨跌幅(24小时交易手续费) |
| &ensp;&ensp;&#124;─total7DayUsdFees | number | 7日交易手续费 |
| &ensp;&ensp;&#124;─changeTotal7DayUsdFees | number | 涨跌幅(7日交易手续费) |
| &ensp;&ensp;&#124;─last7DayTvls | array | TVL 图表数据 |
| &ensp;&ensp;&ensp;&ensp;&#124;─ | object |  |
| &ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&#124;─date | string |  |
| &ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&#124;─usdOfTvl | number |  |
| &ensp;&ensp;&#124;─last24HourVolumes | array | Volume 图表数据 |
| &ensp;&ensp;&ensp;&ensp;&#124;─ | object |  |
| &ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&#124;─hour | integer |  |
| &ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&#124;─usdOfVolume | number |  |

**Response Demo:**

```json
{
  "code": 0,
  "message": "",
  "result": {
    "totalUsdOfTvl": 0.0,
    "changeOfTotalUsdOfTvl": 0.0,
    "totalUsdVolume": 0.0,
    "changeOfTotalUsdVolume": 0.0,
    "total24HourUsdFees": 0.0,
    "changeOfTotal24HourUsdFees": 0.0,
    "total7DayUsdFees": 0.0,
    "changeTotal7DayUsdFees": 0.0,
    "last7DayTvls": [
      {
        "date": "",
        "usdOfTvl": 0.0
      }
    ],
    "last24HourVolumes": [
      {
        "hour": 0,
        "usdOfVolume": 0.0
      }
    ]
  }
}
```




---
## ~~All Swap Pools~~

> BASIC

**Path:** /v1/light/dao/swap/all/pools

**Method:** GET

> REQUEST



> RESPONSE

**Headers:**

| name | value | required | desc |
| ------------ | ------------ | ------------ | ------------ |
| content-type | application/json;charset=UTF-8 | NO |  |

**Body:**

| name | type | desc |
| ------------ | ------------ | ------------ |
| code | integer |  |
| message | string |  |
| result | array |  |
| &ensp;&ensp;&#124;─ | object |  |
| &ensp;&ensp;&ensp;&ensp;&#124;─name | string |  |
| &ensp;&ensp;&ensp;&ensp;&#124;─address | string |  |
| &ensp;&ensp;&ensp;&ensp;&#124;─feeRate | number | 费率（0.003） |
| &ensp;&ensp;&ensp;&ensp;&#124;─token0Symbol | string | token0 symbol |
| &ensp;&ensp;&ensp;&ensp;&#124;─token0Address | string |  |
| &ensp;&ensp;&ensp;&ensp;&#124;─token1Symbol | string | token1 symbol |
| &ensp;&ensp;&ensp;&ensp;&#124;─token1Address | string |  |
| &ensp;&ensp;&ensp;&ensp;&#124;─token0Amount | number | token0 TVL |
| &ensp;&ensp;&ensp;&ensp;&#124;─token1Amount | number | token1 TVL |
| &ensp;&ensp;&ensp;&ensp;&#124;─usdOfAmount | number | TVL(token0Amount + token1Amount) |
| &ensp;&ensp;&ensp;&ensp;&#124;─token0Fees | number | token0 24h fees |
| &ensp;&ensp;&ensp;&ensp;&#124;─token1Fees | number | token1 24h fees |
| &ensp;&ensp;&ensp;&ensp;&#124;─usdOfVolume | number | 24h 交易量 |
| &ensp;&ensp;&ensp;&ensp;&#124;─apr | number | Basis APR |
| &ensp;&ensp;&ensp;&ensp;&#124;─maxApr | number | Boost APR |

**Response Demo:**

```json
{
  "code": 0,
  "message": "",
  "result": [
    {
      "name": "",
      "address": "",
      "feeRate": 0.0,
      "token0Symbol": "",
      "token0Address": "",
      "token1Symbol": "",
      "token1Address": "",
      "token0Amount": 0.0,
      "token1Amount": 0.0,
      "usdOfAmount": 0.0,
      "token0Fees": 0.0,
      "token1Fees": 0.0,
      "usdOfVolume": 0.0,
      "apr": 0.0,
      "maxApr": 0.0
    }
  ]
}
```




---
## ~~Pool Detail~~

> BASIC

**Path:** /v1/light/dao/swap/pool/detail

**Method:** GET

> REQUEST

**Query:**

| name | value | required | desc |
| ------------ | ------------ | ------------ | ------------ |
| address |  | YES |  |



> RESPONSE

**Headers:**

| name | value | required | desc |
| ------------ | ------------ | ------------ | ------------ |
| content-type | application/json;charset=UTF-8 | NO |  |

**Body:**

| name | type | desc |
| ------------ | ------------ | ------------ |
| code | integer |  |
| message | string |  |
| result | object |  |
| &ensp;&ensp;&#124;─name | string |  |
| &ensp;&ensp;&#124;─address | string |  |
| &ensp;&ensp;&#124;─token0Amount | number | token0 余额 |
| &ensp;&ensp;&#124;─usdOfToken0Amount | number | token0 余额估值 |
| &ensp;&ensp;&#124;─token1Amount | number | token1 余额 |
| &ensp;&ensp;&#124;─usdOfToken1Amount | number | token1 余额估值 |
| &ensp;&ensp;&#124;─apr | number | Basis APR |
| &ensp;&ensp;&#124;─maxApr | number | Boost APR |
| &ensp;&ensp;&#124;─rewardLtPerDay | number | 每天产生LT 的数量 |
| &ensp;&ensp;&#124;─percentOfReward | number | 通胀率的占比 |
| &ensp;&ensp;&#124;─poolUsdOfTvl | number | 当前TVL 估值(锁定的总价值) |
| &ensp;&ensp;&#124;─changeOfPoolUsdOfTvl | number | 涨跌幅(当前TVL 估值) |
| &ensp;&ensp;&#124;─poolUsdVolume | number | 24交易量 |
| &ensp;&ensp;&#124;─changeOfPoolUsdVolume | number | 涨跌幅(24交易量) |
| &ensp;&ensp;&#124;─pool24HourUsdFees | number | 24小时交易手续费 |
| &ensp;&ensp;&#124;─changeOfPool24HourUsdFees | number | 涨跌幅(24小时交易手续费) |
| &ensp;&ensp;&#124;─pool7DayUsdFees | number | 7日交易手续费 |
| &ensp;&ensp;&#124;─changePool7DayUsdFees | number | 涨跌幅(7日交易手续费) |

**Response Demo:**

```json
{
  "code": 0,
  "message": "",
  "result": {
    "name": "",
    "address": "",
    "token0Amount": 0.0,
    "usdOfToken0Amount": 0.0,
    "token1Amount": 0.0,
    "usdOfToken1Amount": 0.0,
    "apr": 0.0,
    "maxApr": 0.0,
    "rewardLtPerDay": 0.0,
    "percentOfReward": 0.0,
    "poolUsdOfTvl": 0.0,
    "changeOfPoolUsdOfTvl": 0.0,
    "poolUsdVolume": 0.0,
    "changeOfPoolUsdVolume": 0.0,
    "pool24HourUsdFees": 0.0,
    "changeOfPool24HourUsdFees": 0.0,
    "pool7DayUsdFees": 0.0,
    "changePool7DayUsdFees": 0.0
  }
}
```




---
## ~~Pool Detail Volume~~

> BASIC

**Path:** /v1/light/dao/swap/pool/detail/volume

**Method:** GET

> REQUEST

**Query:**

| name | value | required | desc |
| ------------ | ------------ | ------------ | ------------ |
| address |  | YES |  |
| perid |  | YES |  |



> RESPONSE

**Headers:**

| name | value | required | desc |
| ------------ | ------------ | ------------ | ------------ |
| content-type | application/json;charset=UTF-8 | NO |  |

**Body:**

| name | type | desc |
| ------------ | ------------ | ------------ |
| code | integer |  |
| message | string |  |
| result | object |  |

**Response Demo:**

```json
{
  "code": 0,
  "message": "",
  "result": {}
}
```




---
## ~~Pool Detail TVL~~

> BASIC

**Path:** /v1/light/dao/swap/pool/detail/tvl

**Method:** GET

> REQUEST

**Query:**

| name | value | required | desc |
| ------------ | ------------ | ------------ | ------------ |
| address |  | YES |  |
| perid |  | YES |  |



> RESPONSE

**Headers:**

| name | value | required | desc |
| ------------ | ------------ | ------------ | ------------ |
| content-type | application/json;charset=UTF-8 | NO |  |

**Body:**

| name | type | desc |
| ------------ | ------------ | ------------ |
| code | integer |  |
| message | string |  |
| result | object |  |

**Response Demo:**

```json
{
  "code": 0,
  "message": "",
  "result": {}
}
```




---
## ~~Pool Detail Fees~~

> BASIC

**Path:** /v1/light/dao/swap/pool/detail/fees

**Method:** GET

> REQUEST

**Query:**

| name | value | required | desc |
| ------------ | ------------ | ------------ | ------------ |
| address |  | YES |  |
| perid |  | YES |  |



> RESPONSE

**Headers:**

| name | value | required | desc |
| ------------ | ------------ | ------------ | ------------ |
| content-type | application/json;charset=UTF-8 | NO |  |

**Body:**

| name | type | desc |
| ------------ | ------------ | ------------ |
| code | integer |  |
| message | string |  |
| result | object |  |

**Response Demo:**

```json
{
  "code": 0,
  "message": "",
  "result": {}
}
```




---
## ~~Pool Detail Information~~

> BASIC

**Path:** /v1/light/dao/swap/pool/information

**Method:** GET

> REQUEST

**Query:**

| name | value | required | desc |
| ------------ | ------------ | ------------ | ------------ |
| address |  | YES |  |



> RESPONSE

**Headers:**

| name | value | required | desc |
| ------------ | ------------ | ------------ | ------------ |
| content-type | application/json;charset=UTF-8 | NO |  |

**Body:**

| name | type | desc |
| ------------ | ------------ | ------------ |
| code | integer |  |
| message | string |  |
| result | object |  |
| &ensp;&ensp;&#124;─name | string |  |
| &ensp;&ensp;&#124;─address | string |  |
| &ensp;&ensp;&#124;─creator | string |  |
| &ensp;&ensp;&#124;─feeRate | number |  |
| &ensp;&ensp;&#124;─totalSwapVolume | number |  |
| &ensp;&ensp;&#124;─totalSwapFee | number |  |
| &ensp;&ensp;&#124;─totalNumberOfTrade | integer |  |

**Response Demo:**

```json
{
  "code": 0,
  "message": "",
  "result": {
    "name": "",
    "address": "",
    "creator": "",
    "feeRate": 0.0,
    "totalSwapVolume": 0.0,
    "totalSwapFee": 0.0,
    "totalNumberOfTrade": 0
  }
}
```




---
## ~~Pool Detail Transaction~~

> BASIC

**Path:** /v1/light/dao/swap/pool/transactions

**Method:** GET

> REQUEST

**Query:**

| name | value | required | desc |
| ------------ | ------------ | ------------ | ------------ |
| address |  | YES |  |
| event |  | YES | all add swap remove |
| page | 1 | YES |  |
| pageSize | 10 | YES |  |



> RESPONSE

**Headers:**

| name | value | required | desc |
| ------------ | ------------ | ------------ | ------------ |
| content-type | application/json;charset=UTF-8 | NO |  |

**Body:**

| name | type | desc |
| ------------ | ------------ | ------------ |
| code | integer |  |
| message | string |  |
| result | object |  |

**Response Demo:**

```json
{
  "code": 0,
  "message": "",
  "result": {}
}
```




---
## Mint Detail Pools 

> BASIC

**Path:** /v1/light/dao/swap/pool/transactions

**Method:** GET

> REQUEST

**Query:**

| name | value | required | desc |
| ------------ | ------------ | ------------ | ------------ |
| address |  | NO | user address |
| page | 1 | YES |  |
| pageSize | 10 | YES |  |



> RESPONSE

**Headers:**

| name | value | required | desc |
| ------------ | ------------ | ------------ | ------------ |
| content-type | application/json;charset=UTF-8 | NO |  |

**Body:**

| name | type | desc |
| ------------ | ------------ | ------------ |
| code | integer |  |
| message | string |  |
| result | object |  |

**Response Demo:**

```json
{
  "code": 0,
  "message": "",
  "result": {}
}
```



