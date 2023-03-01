import React from 'react'
import Button from 'components/antd/Button'

import './index.scss'
import Select from 'components/antd/Select'
import Table from 'components/antd/Table'
const columns = [
  { title: 'Name', dataIndex: 'name', key: 'name' },
  { title: 'Platform', dataIndex: 'platform', key: 'platform' },
  { title: 'Version', dataIndex: 'version', key: 'version' },
  { title: 'Upgraded', dataIndex: 'upgradeNum', key: 'upgradeNum' },
  { title: 'Creator', dataIndex: 'creator', key: 'creator' },
  { title: 'Date', dataIndex: 'createdAt', key: 'createdAt' },
  { title: 'Action', key: 'operation', render: () => <span>Publish</span> }
]

const data: {
  key: number
  name: string
  platform: string
  version: string
  upgradeNum: number
  creator: string
  createdAt: string
}[] = []
for (let i = 0; i < 3; ++i) {
  data.push({
    key: i,
    name: 'Screem',
    platform: 'iOS',
    version: '10.3.4.5654',
    upgradeNum: 500,
    creator: 'Jack',
    createdAt: '2014-12-24 23:12:00'
  })
}

export default function TestComponent() {
  return (
    <div className="test-component-wrap">
      <div className="test-component-row">
        <Table
          dataSource={data}
          columns={columns}
          pagination={{
            total: 500
          }}
        ></Table>
      </div>
      <div className="test-component-row">
        <Table
          dataSource={data}
          columns={columns}
          pagination={{
            showSizeChanger: true,
            defaultCurrent: 1,
            total: 500,
            showQuickJumper: true,
            showTotal: total => {
              return <div>{total} in total</div>
            }
          }}
        ></Table>
      </div>

      <div className="test-component-row">
        <Table columns={columns} locale={{ emptyText: 'empty data' }}></Table>
      </div>
      <div className="test-component-row">
        <div className="test-component-item">
          <Select
            style={{ width: '300px' }}
            defaultValue={1}
            mode="multiple"
            options={[
              { label: '测试', value: 1 },
              { label: '测试2', value: 2 }
            ]}
          ></Select>
        </div>
      </div>
      <div className="test-component-row">
        <div className="test-component-item">
          <Select
            style={{ width: '300px' }}
            defaultValue={1}
            options={[
              { label: '测试', value: 1 },
              { label: '测试2', value: 2 }
            ]}
          ></Select>
        </div>
        <div className="test-component-item">
          <Select style={{ width: '300px' }} placeholder="测试placeholder">
            {[
              { label: '测试', value: 1 },
              { label: '测试2', value: 2 }
            ].map((item, index) => {
              return (
                <Select.Option key={index} value={item.value}>
                  {item.label}
                </Select.Option>
              )
            })}
          </Select>
        </div>
      </div>
      <div className="test-component-row">
        <div className="test-component-item">
          <Button className="test-component-item" type="ghost">
            ghost
          </Button>
        </div>
        <div className="test-component-item">
          <Button className="test-component-item" type="ghost" disabled>
            ghost disabled
          </Button>
        </div>
      </div>
      <div className="test-component-row">
        <div className="test-component-item">
          <Button className="test-component-item" type="default">
            default
          </Button>
        </div>
        <div className="test-component-item">
          <Button className="test-component-item" type="default" disabled>
            default disabled
          </Button>
        </div>
      </div>
      <div className="test-component-row">
        <div className="test-component-item">
          <Button className="test-component-item" type="primary">
            primary
          </Button>
        </div>
        <div className="test-component-item">
          <Button className="test-component-item" type="primary" disabled>
            primary disabled
          </Button>
        </div>
      </div>
      <div className="test-component-row">
        <div className="test-component-item">
          <Button className="test-component-item" type="dashed">
            dashed
          </Button>
        </div>
        <div className="test-component-item">
          <Button className="test-component-item" type="dashed" disabled>
            dashed disabled
          </Button>
        </div>
      </div>
      <div className="test-component-row">
        <div className="test-component-item">
          <Button className="test-component-item" type="danger">
            danger
          </Button>
        </div>
        <div className="test-component-item">
          <Button className="test-component-item" type="danger" disabled>
            danger disabled
          </Button>
        </div>
      </div>
      <div className="test-component-row">
        <div className="test-component-item">
          <Button className="test-component-item" type="link">
            link
          </Button>
        </div>
        <div className="test-component-item">
          <Button className="test-component-item" type="link" disabled>
            link disabled
          </Button>
        </div>
      </div>
    </div>
  )
}
