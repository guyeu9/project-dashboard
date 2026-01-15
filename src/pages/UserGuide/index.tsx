import { Card, Typography, Space, Divider, Row, Col, Alert, Tag } from 'antd'
import {
  DashboardOutlined,
  ProjectOutlined,
  TeamOutlined,
  FileTextOutlined,
  SettingOutlined,
  RocketOutlined,
  CheckCircleOutlined,
  BulbOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  EyeOutlined,
  FileSearchOutlined
} from '@ant-design/icons'
import './index.css'

const { Title, Paragraph, Text } = Typography

function UserGuidePage() {
  return (
    <div className="user-guide-page">
      <Card className="guide-header-card" variant="borderless">
        <div className="header-content">
          <RocketOutlined className="header-icon" />
          <div>
            <Title level={2} className="page-title">使用说明</Title>
            <Paragraph className="page-subtitle">全面指南，快速上手联调排期管理平台</Paragraph>
          </div>
        </div>
      </Card>

      <div className="guide-content">
        <Alert
          message="💡 提示：本平台专为联调排期管理设计，所有数据实时保存到服务器，支持多端同步访问。"
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Card title="1. 项目全景" className="guide-section" variant="borderless">
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div className="function-overview">
              <div className="overview-header">
                <DashboardOutlined className="overview-icon" />
                <Title level={4}>功能概述</Title>
              </div>
              <Paragraph>
                查看所有项目的整体进度，通过聚合甘特图掌握全局项目状态，支持按状态快速筛选项目。
              </Paragraph>
            </div>

            <Divider />

            <div className="function-detail">
              <div className="detail-header">
                <InfoCircleOutlined className="detail-icon" />
                <Title level={4}>界面说明</Title>
              </div>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <div className="interface-item">
                    <Text strong>顶部指标卡片</Text>
                    <Paragraph type="secondary">
                      显示各状态项目数量：全部项目、待开始、正常推进、存在风险、已延期。
                      点击卡片可快速筛选对应状态的项目。
                    </Paragraph>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="interface-item">
                    <Text strong>项目进度甘特图</Text>
                    <Paragraph type="secondary">
                      Y轴显示项目列表，X轴显示时间轴（支持120天滑动浏览）。
                      红色竖线标识今日位置，周末显示绿色背景。
                    </Paragraph>
                  </div>
                </Col>
              </Row>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <div className="interface-item">
                    <Text strong>项目进度条</Text>
                    <Paragraph type="secondary">
                      显示项目起止时间和进度，颜色标识项目状态：
                      <Tag color="green">绿色</Tag> 正常、
                      <Tag color="orange">橙色</Tag> 风险、
                      <Tag color="red">红色</Tag> 延期。
                    </Paragraph>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="interface-item">
                    <Text strong>风险标识</Text>
                    <Paragraph type="secondary">
                      项目日期格中显示红色感叹号（!），表示该天记录了风险或延期。
                      鼠标悬浮可查看详细风险备注。
                    </Paragraph>
                  </div>
                </Col>
              </Row>
            </div>

            <Divider />

            <div className="function-steps">
              <div className="steps-header">
                <CheckCircleOutlined className="steps-icon" />
                <Title level={4}>操作步骤</Title>
              </div>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div className="step-item">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <Text strong>筛选项目</Text>
                    <Paragraph>点击顶部状态卡片，快速筛选对应状态的项目。再次点击可取消筛选。</Paragraph>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <Text strong>查看项目详情</Text>
                    <Paragraph>点击任意项目进度条，进入项目详情页查看任务排期。</Paragraph>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <Text strong>浏览时间轴</Text>
                    <Paragraph>使用甘特图上方的导航按钮（上个月、今天、下个月）或左右滑动浏览不同日期范围。</Paragraph>
                  </div>
                </div>
              </Space>
            </div>

            <Divider />

            <div className="function-tips">
              <div className="tips-header">
                <BulbOutlined className="tips-icon" />
                <Title level={4}>快捷技巧</Title>
              </div>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <div className="tip-item">
                    <Tag color="blue">快捷筛选</Tag>
                    <Paragraph type="secondary">点击状态卡片可快速筛选对应状态的项目</Paragraph>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="tip-item">
                    <Tag color="green">自动定位</Tag>
                    <Paragraph type="secondary">甘特图自动定位到当前日期前5天，红色竖线标识今日</Paragraph>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="tip-item">
                    <Tag color="purple">拖拽浏览</Tag>
                    <Paragraph type="secondary">支持触摸拖拽甘特图，快速浏览不同日期范围</Paragraph>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="tip-item">
                    <Tag color="orange">悬浮详情</Tag>
                    <Paragraph type="secondary">鼠标悬浮项目条可查看项目详细信息（合作方、人员等）</Paragraph>
                  </div>
                </Col>
              </Row>
            </div>

            <Divider />

            <div className="function-notes">
              <div className="notes-header">
                <WarningOutlined className="notes-icon" />
                <Title level={4}>注意事项</Title>
              </div>
              <ul className="notes-list">
                <li>项目状态颜色：<Tag color="green">绿色</Tag> 正常推进、<Tag color="orange">橙色</Tag> 存在风险、<Tag color="red">红色</Tag> 已延期、<Tag color="purple">紫色</Tag> 待开始</li>
                <li>风险标识：项目日期格中的红色感叹号（!）表示该天记录了风险或延期，悬浮可查看详情</li>
                <li>周末标识：甘特图周末日期显示浅绿色背景，便于区分工作日</li>
                <li>今日标识：红色竖线贯穿整个甘特图，清晰标识当前日期位置</li>
                <li>已完成项目：项目全景页面不显示已完成的项目，可在项目管理页面查看</li>
              </ul>
            </div>
          </Space>
        </Card>

        <Card title="2. 项目管理" className="guide-section" variant="borderless">
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div className="function-overview">
              <div className="overview-header">
                <ProjectOutlined className="overview-icon" />
                <Title level={4}>功能概述</Title>
              </div>
              <Paragraph>
                创建、编辑、删除项目，管理项目基本信息，支持卡片和列表两种视图模式，提供强大的筛选和排序功能。
              </Paragraph>
            </div>

            <Divider />

            <div className="function-detail">
              <div className="detail-header">
                <InfoCircleOutlined className="detail-icon" />
                <Title level={4}>界面说明</Title>
              </div>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <div className="interface-item">
                    <Text strong>视图切换</Text>
                    <Paragraph type="secondary">
                      支持卡片视图和列表视图切换，卡片视图直观展示项目信息，列表视图便于批量操作。
                    </Paragraph>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="interface-item">
                    <Text strong>筛选功能</Text>
                    <Paragraph type="secondary">
                      支持按状态（待开始、正常、延期、风险、已完成）、负责人、日期范围、项目名称搜索等多维度筛选。
                    </Paragraph>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="interface-item">
                    <Text strong>排序功能</Text>
                    <Paragraph type="secondary">
                      支持按项目名称、开始日期、进度进行升序或降序排列。
                    </Paragraph>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="interface-item">
                    <Text strong>项目卡片</Text>
                    <Paragraph type="secondary">
                      显示项目名称、状态、进度、负责人、起止日期、合作方等信息，支持快速编辑和删除操作。
                    </Paragraph>
                  </div>
                </Col>
              </Row>
            </div>

            <Divider />

            <div className="function-steps">
              <div className="steps-header">
                <CheckCircleOutlined className="steps-icon" />
                <Title level={4}>操作步骤</Title>
              </div>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div className="step-item">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <Text strong>新建项目</Text>
                    <Paragraph>点击页面右上角「新建项目」按钮，填写项目信息（项目名称为必填项），点击「保存」完成创建。</Paragraph>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <Text strong>编辑项目</Text>
                    <Paragraph>点击项目卡片右上角的「编辑」按钮，修改项目信息，点击「保存」完成更新。</Paragraph>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <Text strong>删除项目</Text>
                    <Paragraph>点击项目卡片右上角的「删除」按钮，确认后删除项目（仅管理员可操作）。</Paragraph>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">4</div>
                  <div className="step-content">
                    <Text strong>进入项目详情</Text>
                    <Paragraph>点击项目卡片任意位置，进入项目详情页查看任务排期和管理任务。</Paragraph>
                  </div>
                </div>
              </Space>
            </div>

            <Divider />

            <div className="function-tips">
              <div className="tips-header">
                <BulbOutlined className="tips-icon" />
                <Title level={4}>快捷技巧</Title>
              </div>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <div className="tip-item">
                    <Tag color="blue">组合筛选</Tag>
                    <Paragraph type="secondary">可同时使用多个筛选条件（状态+负责人+日期范围）快速定位目标项目</Paragraph>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="tip-item">
                    <Tag color="green">快速搜索</Tag>
                    <Paragraph type="secondary">在搜索框输入项目名称，实时过滤项目列表</Paragraph>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="tip-item">
                    <Tag color="purple">视图切换</Tag>
                    <Paragraph type="secondary">根据需要切换卡片视图或列表视图，卡片视图更直观，列表视图更高效</Paragraph>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="tip-item">
                    <Tag color="orange">排序优化</Tag>
                    <Paragraph type="secondary">按开始日期排序可快速查看即将开始或已开始的项目</Paragraph>
                  </div>
                </Col>
              </Row>
            </div>

            <Divider />

            <div className="function-notes">
              <div className="notes-header">
                <WarningOutlined className="notes-icon" />
                <Title level={4}>注意事项</Title>
              </div>
              <ul className="notes-list">
                <li><Text strong>权限说明：</Text> 游客只能查看项目，管理员可以创建、编辑、删除项目</li>
                <li><Text strong>必填项：</Text> 新建项目时仅「项目名称」为必填项，其他信息可后续补充</li>
                <li><Text strong>状态自动计算：</Text> 项目状态根据任务进度和日期自动计算（正常、风险、延期），无需手动设置</li>
                <li><Text strong>数据同步：</Text> 所有修改实时保存到服务器，多端访问数据保持一致</li>
                <li><Text strong>删除确认：</Text> 删除项目会同时删除该项目的所有任务和进度记录，请谨慎操作</li>
              </ul>
            </div>
          </Space>
        </Card>

        <Card title="3. 资源排期" className="guide-section" variant="borderless">
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div className="function-overview">
              <div className="overview-header">
                <TeamOutlined className="overview-icon" />
                <Title level={4}>功能概述</Title>
              </div>
              <Paragraph>
                查看人员任务分配情况，通过热力图直观识别资源冲突和瓶颈，支持按日期范围和人员筛选。
              </Paragraph>
            </div>

            <Divider />

            <div className="function-detail">
              <div className="detail-header">
                <InfoCircleOutlined className="detail-icon" />
                <Title level={4}>界面说明</Title>
              </div>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <div className="interface-item">
                    <Text strong>热力图视图</Text>
                    <Paragraph type="secondary">
                      通过颜色深浅表示人员任务数量，颜色越深表示任务越多，直观发现资源瓶颈。
                    </Paragraph>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="interface-item">
                    <Text strong>数值视图</Text>
                    <Paragraph type="secondary">
                      每个单元格显示具体任务数量，便于精确了解人员工作负荷。
                    </Paragraph>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="interface-item">
                    <Text strong>日期范围选择</Text>
                    <Paragraph type="secondary">
                      支持本周、本月、自定义日期范围三种模式，灵活查看不同时间段的资源分配。
                    </Paragraph>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="interface-item">
                    <Text strong>人员筛选</Text>
                    <Paragraph type="secondary">
                      支持按人员名称筛选，快速查看特定人员的任务分配情况。
                    </Paragraph>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="interface-item">
                    <Text strong>侧边详情面板</Text>
                    <Paragraph type="secondary">
                      点击单元格可打开侧边面板，查看该人员在该日期的所有任务详情。
                    </Paragraph>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="interface-item">
                    <Text strong>状态标识</Text>
                    <Paragraph type="secondary">
                      <Tag color="green">绿色</Tag> 空闲（1个任务）、
                      <Tag color="orange">橙色</Tag> 忙碌（2-3个任务）、
                      <Tag color="red">红色</Tag> 超载（≥4个任务）。
                    </Paragraph>
                  </div>
                </Col>
              </Row>
            </div>

            <Divider />

            <div className="function-steps">
              <div className="steps-header">
                <CheckCircleOutlined className="steps-icon" />
                <Title level={4}>操作步骤</Title>
              </div>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div className="step-item">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <Text strong>选择日期范围</Text>
                    <Paragraph>在页面顶部选择「本周」、「本月」或「自定义」日期范围。</Paragraph>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <Text strong>查看热力图</Text>
                    <Paragraph>通过热力图颜色深浅快速识别资源分配情况，深色区域表示任务集中。</Paragraph>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <Text strong>查看任务详情</Text>
                    <Paragraph>点击任意单元格，打开侧边面板查看该人员在该日期的所有任务详情。</Paragraph>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">4</div>
                  <div className="step-content">
                    <Text strong>筛选人员</Text>
                    <Paragraph>在人员筛选框输入姓名，快速查看特定人员的任务分配情况。</Paragraph>
                  </div>
                </div>
              </Space>
            </div>

            <Divider />

            <div className="function-tips">
              <div className="tips-header">
                <BulbOutlined className="tips-icon" />
                <Title level={4}>快捷技巧</Title>
              </div>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <div className="tip-item">
                    <Tag color="blue">快速定位</Tag>
                    <Paragraph type="secondary">使用日期范围选择器快速跳转到指定时间段</Paragraph>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="tip-item">
                    <Tag color="green">视图切换</Tag>
                    <Paragraph type="secondary">在热力图和数值视图之间切换，根据需要选择最适合的展示方式</Paragraph>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="tip-item">
                    <Tag color="purple">人员搜索</Tag>
                    <Paragraph type="secondary">在筛选框输入人员姓名，快速定位目标人员</Paragraph>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="tip-item">
                    <Tag color="orange">详情查看</Tag>
                    <Paragraph type="secondary">点击单元格查看任务详情，了解具体任务分配情况</Paragraph>
                  </div>
                </Col>
              </Row>
            </div>

            <Divider />

            <div className="function-notes">
              <div className="notes-header">
                <WarningOutlined className="notes-icon" />
                <Title level={4}>注意事项</Title>
              </div>
              <ul className="notes-list">
                <li><Text strong>超载阈值：</Text> 默认≥4个任务为超载，可在设置中心调整阈值</li>
                <li><Text strong>空闲阈值：</Text> 默认1个任务为空闲，可在设置中心调整阈值</li>
                <li><Text strong>任务统计：</Text> 仅统计进行中的项目任务，已完成项目的任务不计入统计</li>
                <li><Text strong>实时更新：</Text> 任务变更会实时更新热力图数据，无需手动刷新</li>
                <li><Text strong>人员识别：</Text> 自动从任务负责人字段提取人员信息，无需手动配置</li>
              </ul>
            </div>
          </Space>
        </Card>

        <Card title="4. 智能解析" className="guide-section" variant="borderless">
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div className="function-overview">
              <div className="overview-header">
                <FileTextOutlined className="overview-icon" />
                <Title level={4}>功能概述</Title>
              </div>
              <Paragraph>
                支持特定格式的排期文本一键解析，自动识别阶段、日期和人员，快速创建项目和任务。
              </Paragraph>
            </div>

            <Divider />

            <div className="function-detail">
              <div className="detail-header">
                <InfoCircleOutlined className="detail-icon" />
                <Title level={4}>界面说明</Title>
              </div>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <div className="interface-item">
                    <Text strong>文本输入框</Text>
                    <Paragraph type="secondary">
                      支持多行文本输入，提供格式提示和示例，便于快速输入排期信息。
                    </Paragraph>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="interface-item">
                    <Text strong>解析结果预览</Text>
                    <Paragraph type="secondary">
                      实时显示解析结果，包括识别到的项目、阶段、日期、人员等信息。
                    </Paragraph>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="interface-item">
                    <Text strong>错误提示</Text>
                    <Paragraph type="secondary">
                      解析失败时显示错误提示，指出无法识别的内容，便于修正。
                    </Paragraph>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="interface-item">
                    <Text strong>保存按钮</Text>
                    <Paragraph type="secondary">
                      解析成功后点击「保存」按钮，将解析结果保存到系统中。
                    </Paragraph>
                  </div>
                </Col>
              </Row>
            </div>

            <Divider />

            <div className="function-steps">
              <div className="steps-header">
                <CheckCircleOutlined className="steps-icon" />
                <Title level={4}>操作步骤</Title>
              </div>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div className="step-item">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <Text strong>输入排期文本</Text>
                    <Paragraph>在文本框中输入排期信息，参考格式提示和示例。</Paragraph>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <Text strong>点击解析</Text>
                    <Paragraph>点击「解析」按钮，系统自动识别阶段、日期和人员信息。</Paragraph>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <Text strong>检查解析结果</Text>
                    <Paragraph>在解析结果预览区检查识别到的信息是否正确，如有错误可修改文本后重新解析。</Paragraph>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">4</div>
                  <div className="step-content">
                    <Text strong>保存结果</Text>
                    <Paragraph>确认解析结果正确后，点击「保存」按钮，将项目和任务保存到系统中。</Paragraph>
                  </div>
                </div>
              </Space>
            </div>

            <Divider />

            <div className="function-tips">
              <div className="tips-header">
                <BulbOutlined className="tips-icon" />
                <Title level={4}>快捷技巧</Title>
              </div>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <div className="tip-item">
                    <Tag color="blue">格式模板</Tag>
                    <Paragraph type="secondary">使用提供的格式模板快速输入，减少输入错误</Paragraph>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="tip-item">
                    <Tag color="green">批量解析</Tag>
                    <Paragraph type="secondary">可一次性输入多个项目的排期信息，批量创建项目和任务</Paragraph>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="tip-item">
                    <Tag color="purple">人员识别</Tag>
                    <Paragraph type="secondary">使用@符号标识人员，系统自动识别并分配到对应任务</Paragraph>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="tip-item">
                    <Tag color="orange">快速复制</Tag>
                    <Paragraph type="secondary">可从其他文档复制排期文本，快速粘贴到输入框</Paragraph>
                  </div>
                </Col>
              </Row>
            </div>

            <Divider />

            <div className="function-notes">
              <div className="notes-header">
                <WarningOutlined className="notes-icon" />
                <Title level={4}>注意事项</Title>
              </div>
              <ul className="notes-list">
                <li><Text strong>格式要求：</Text> 必须严格按照格式要求输入，否则无法正确解析</li>
                <li><Text strong>日期格式：</Text> 日期格式为MM.DD（如12.18），年份默认为当年</li>
                <li><Text strong>阶段识别：</Text> 支持识别的阶段包括：开发排期、开发联调、测试排期、测试联调、产品UAT、上线</li>
                <li><Text strong>人员识别：</Text> 使用@符号后跟人员姓名，系统自动识别并分配到对应任务</li>
                <li><Text strong>时间范围：</Text> 日期格式为MM.DD-MM.DD（如12.18-1.14），表示起止日期</li>
                <li><Text strong>权限说明：</Text> 仅管理员可以保存解析结果，游客只能预览</li>
                <li><Text strong>数据覆盖：</Text> 如果项目名称已存在，解析结果会更新现有项目，不会创建新项目</li>
              </ul>
            </div>
          </Space>
        </Card>

        <Card title="5. 数据管理" className="guide-section" variant="borderless">
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div className="function-overview">
              <div className="overview-header">
                <FileSearchOutlined className="overview-icon" />
                <Title level={4}>功能概述</Title>
              </div>
              <Paragraph>
                导入导出项目数据，支持Excel和JSON格式，查看历史操作记录，实现数据备份和恢复。
              </Paragraph>
            </div>

            <Divider />

            <div className="function-detail">
              <div className="detail-header">
                <InfoCircleOutlined className="detail-icon" />
                <Title level={4}>界面说明</Title>
              </div>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={8}>
                  <div className="interface-item">
                    <Text strong>智能解析标签</Text>
                    <Paragraph type="secondary">
                      输入排期文本，一键解析并创建项目和任务，提供格式提示和示例。
                    </Paragraph>
                  </div>
                </Col>
                <Col xs={24} md={8}>
                  <div className="interface-item">
                    <Text strong>导入导出标签</Text>
                    <Paragraph type="secondary">
                      支持导入Excel和JSON文件，导出数据为Excel和JSON格式，便于数据备份和迁移。
                    </Paragraph>
                  </div>
                </Col>
                <Col xs={24} md={8}>
                  <div className="interface-item">
                    <Text strong>历史记录标签</Text>
                    <Paragraph type="secondary">
                      查看所有操作历史记录，包括创建、编辑、删除等操作的时间和详情。
                    </Paragraph>
                  </div>
                </Col>
              </Row>
            </div>

            <Divider />

            <div className="function-steps">
              <div className="steps-header">
                <CheckCircleOutlined className="steps-icon" />
                <Title level={4}>操作步骤</Title>
              </div>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div className="step-item">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <Text strong>导出数据</Text>
                    <Paragraph>切换到「导入导出」标签，点击「导出数据」按钮，选择Excel或JSON格式导出。</Paragraph>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <Text strong>导入数据</Text>
                    <Paragraph>点击「导入数据」按钮，选择Excel或JSON文件，确认后导入数据。</Paragraph>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <Text strong>查看历史</Text>
                    <Paragraph>切换到「历史记录」标签，查看所有操作记录，支持按时间、操作类型筛选。</Paragraph>
                  </div>
                </div>
              </Space>
            </div>

            <Divider />

            <div className="function-tips">
              <div className="tips-header">
                <BulbOutlined className="tips-icon" />
                <Title level={4}>快捷技巧</Title>
              </div>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <div className="tip-item">
                    <Tag color="blue">定期备份</Tag>
                    <Paragraph type="secondary">建议定期导出数据备份，防止数据丢失</Paragraph>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="tip-item">
                    <Tag color="green">格式选择</Tag>
                    <Paragraph type="secondary">Excel格式便于查看和编辑，JSON格式便于程序处理和数据迁移</Paragraph>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="tip-item">
                    <Tag color="purple">历史筛选</Tag>
                    <Paragraph type="secondary">使用历史记录的筛选功能，快速查找特定操作</Paragraph>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="tip-item">
                    <Tag color="orange">批量操作</Tag>
                    <Paragraph type="secondary">智能解析可批量创建项目和任务，提高录入效率</Paragraph>
                  </div>
                </Col>
              </Row>
            </div>

            <Divider />

            <div className="function-notes">
              <div className="notes-header">
                <WarningOutlined className="notes-icon" />
                <Title level={4}>注意事项</Title>
              </div>
              <ul className="notes-list">
                <li><Text strong>数据覆盖：</Text> 导入数据会覆盖现有数据，请谨慎操作，建议先导出备份</li>
                <li><Text strong>格式兼容：</Text> Excel导出包含项目汇总和每个项目的详细Sheet，导入时需确保格式正确</li>
                <li><Text strong>权限说明：</Text> 仅管理员可以导入导出数据，游客只能查看</li>
                <li><Text strong>历史记录：</Text> 历史记录保留最近1000条操作，超出自动清理</li>
                <li><Text strong>文件大小：</Text> 导入文件建议不超过10MB，过大可能导致导入失败</li>
                <li><Text strong>数据同步：</Text> 所有操作实时保存到服务器，多端访问数据保持一致</li>
              </ul>
            </div>
          </Space>
        </Card>

        <Card title="6. 项目详情" className="guide-section" variant="borderless">
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div className="function-overview">
              <div className="overview-header">
                <EyeOutlined className="overview-icon" />
                <Title level={4}>功能概述</Title>
              </div>
              <Paragraph>
                查看项目详细信息，管理项目任务，记录每日进度，支持任务编辑、添加、删除和进度追踪。
              </Paragraph>
            </div>

            <Divider />

            <div className="function-detail">
              <div className="detail-header">
                <InfoCircleOutlined className="detail-icon" />
                <Title level={4}>界面说明</Title>
              </div>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <div className="interface-item">
                    <Text strong>项目信息卡片</Text>
                    <Paragraph type="secondary">
                      显示项目名称、状态、进度、负责人、PMO、产品经理、合作方、起止日期等核心信息。
                    </Paragraph>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="interface-item">
                    <Text strong>执行甘特图</Text>
                    <Paragraph type="secondary">
                      显示项目所有任务的排期，支持滑动浏览，红色竖线标识今日位置。
                    </Paragraph>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="interface-item">
                    <Text strong>任务进度条</Text>
                    <Paragraph type="secondary">
                      显示任务起止时间、进度、负责人，颜色标识任务类型，支持双击编辑。
                    </Paragraph>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="interface-item">
                    <Text strong>每日进度管理</Text>
                    <Paragraph type="secondary">
                      双击任务条打开每日进度管理器，记录每日进度、状态和备注。
                    </Paragraph>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="interface-item">
                    <Text strong>修改历史记录</Text>
                    <Paragraph type="secondary">
                      查看任务的所有修改历史，包括任务信息变更和进度记录。
                    </Paragraph>
                  </div>
                </Col>
              </Row>
            </div>

            <Divider />

            <div className="function-steps">
              <div className="steps-header">
                <CheckCircleOutlined className="steps-icon" />
                <Title level={4}>操作步骤</Title>
              </div>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div className="step-item">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <Text strong>添加任务</Text>
                    <Paragraph>点击执行甘特图上方的「添加任务」按钮，填写任务信息（类型、起止日期为必填项）。</Paragraph>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <Text strong>编辑任务</Text>
                    <Paragraph>双击任务进度条，修改任务信息，点击「保存」完成更新。</Paragraph>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <Text strong>删除任务</Text>
                    <Paragraph>在任务编辑弹窗中点击「删除」按钮，确认后删除任务。</Paragraph>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">4</div>
                  <div className="step-content">
                    <Text strong>记录进度</Text>
                    <Paragraph>双击任务条，在每日进度管理器中选择日期、状态和备注，点击「保存」记录。</Paragraph>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">5</div>
                  <div className="step-content">
                    <Text strong>查看历史</Text>
                    <Paragraph>点击任务条右侧的「历史」按钮，查看任务的所有修改记录。</Paragraph>
                  </div>
                </div>
              </Space>
            </div>

            <Divider />

            <div className="function-tips">
              <div className="tips-header">
                <BulbOutlined className="tips-icon" />
                <Title level={4}>快捷技巧</Title>
              </div>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <div className="tip-item">
                    <Tag color="blue">双击编辑</Tag>
                    <Paragraph type="secondary">双击任务条快速打开编辑窗口，无需点击编辑按钮</Paragraph>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="tip-item">
                    <Tag color="green">快速定位</Tag>
                    <Paragraph type="secondary">甘特图自动定位到当前日期前5天，红色竖线标识今日</Paragraph>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="tip-item">
                    <Tag color="purple">拖拽浏览</Tag>
                    <Paragraph type="secondary">支持触摸拖拽甘特图，快速浏览不同日期范围</Paragraph>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="tip-item">
                    <Tag color="orange">进度记录</Tag>
                    <Paragraph type="secondary">每日进度管理器支持快速添加和编辑进度记录，提高记录效率</Paragraph>
                  </div>
                </Col>
              </Row>
            </div>

            <Divider />

            <div className="function-notes">
              <div className="notes-header">
                <WarningOutlined className="notes-icon" />
                <Title level={4}>注意事项</Title>
              </div>
              <ul className="notes-list">
                <li><Text strong>权限说明：</Text> 游客只能查看任务和进度，管理员可以添加、编辑、删除任务</li>
                <li><Text strong>必填项：</Text> 新建任务时仅「任务类型」、「开始日期」、「结束日期」为必填项</li>
                <li><Text strong>状态颜色：</Text> 每日进度状态颜色：<Tag color="green">绿色</Tag> 正常、<Tag color="orange">橙色</Tag> 风险、<Tag color="red">红色</Tag> 延期</li>
                <li><Text strong>风险标识：</Text> 项目甘特图日期格中的红色感叹号（!）表示该天记录了风险或延期</li>
                <li><Text strong>进度计算：</Text> 任务进度根据每日进度记录自动计算，无需手动设置</li>
                <li><Text strong>任务类型：</Text> 任务类型颜色在设置中心自定义，不同类型显示不同颜色</li>
                <li><Text strong>数据同步：</Text> 所有修改实时保存到服务器，多端访问数据保持一致</li>
              </ul>
            </div>
          </Space>
        </Card>

        <Card title="7. 设置中心" className="guide-section" variant="borderless">
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div className="function-overview">
              <div className="overview-header">
                <SettingOutlined className="overview-icon" />
                <Title level={4}>功能概述</Title>
              </div>
              <Paragraph>
                管理账户权限，自定义任务类型和系统字段，支持管理员和游客两种身份切换。
              </Paragraph>
            </div>

            <Divider />

            <div className="function-detail">
              <div className="detail-header">
                <InfoCircleOutlined className="detail-icon" />
                <Title level={4}>界面说明</Title>
              </div>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <div className="interface-item">
                    <Text strong>账户信息卡片</Text>
                    <Paragraph type="secondary">
                      显示当前登录身份（管理员/游客），提供登录和退出功能。
                    </Paragraph>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="interface-item">
                    <Text strong>任务类型管理</Text>
                    <Paragraph type="secondary">
                      显示所有任务类型，支持新增、编辑、删除、启用/禁用操作。
                    </Paragraph>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="interface-item">
                    <Text strong>权限说明</Text>
                    <Paragraph type="secondary">
                      管理员可以修改项目、任务、任务类型等所有数据，游客只能查看。
                    </Paragraph>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="interface-item">
                    <Text strong>类型颜色</Text>
                    <Paragraph type="secondary">
                      每个任务类型可自定义颜色，便于在甘特图中区分不同类型的任务。
                    </Paragraph>
                  </div>
                </Col>
              </Row>
            </div>

            <Divider />

            <div className="function-steps">
              <div className="steps-header">
                <CheckCircleOutlined className="steps-icon" />
                <Title level={4}>操作步骤</Title>
              </div>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div className="step-item">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <Text strong>切换身份</Text>
                    <Paragraph>点击右上角头像，选择「管理员一键登录」或输入账号密码登录。</Paragraph>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <Text strong>新增任务类型</Text>
                    <Paragraph>点击「新增任务类型」按钮，填写类型名称和颜色，点击「保存」完成创建。</Paragraph>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <Text strong>编辑任务类型</Text>
                    <Paragraph>点击任务类型右侧的「编辑」按钮，修改类型名称和颜色，点击「保存」完成更新。</Paragraph>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">4</div>
                  <div className="step-content">
                    <Text strong>删除任务类型</Text>
                    <Paragraph>点击任务类型右侧的「删除」按钮，确认后删除类型（刷新后不会影响历史数据）。</Paragraph>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">5</div>
                  <div className="step-content">
                    <Text strong>启用/禁用类型</Text>
                    <Paragraph>点击任务类型右侧的开关，启用或禁用该类型（禁用后不会在新建任务时显示）。</Paragraph>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">6</div>
                  <div className="step-content">
                    <Text strong>退出登录</Text>
                    <Paragraph>管理员身份下点击右上角头像，选择「退出登录」切换回游客身份。</Paragraph>
                  </div>
                </div>
              </Space>
            </div>

            <Divider />

            <div className="function-tips">
              <div className="tips-header">
                <BulbOutlined className="tips-icon" />
                <Title level={4}>快捷技巧</Title>
              </div>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <div className="tip-item">
                    <Tag color="blue">一键登录</Tag>
                    <Paragraph type="secondary">使用「管理员一键登录」快速切换到管理员身份，无需输入账号密码</Paragraph>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="tip-item">
                    <Tag color="green">批量启用</Tag>
                    <Paragraph type="secondary">可批量启用或禁用多个任务类型，快速调整类型状态</Paragraph>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="tip-item">
                    <Tag color="purple">颜色自定义</Tag>
                    <Paragraph type="secondary">使用颜色选择器自定义任务类型颜色，便于在甘特图中区分</Paragraph>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="tip-item">
                    <Tag color="orange">类型管理</Tag>
                    <Paragraph type="secondary">定期清理不使用的任务类型，保持类型列表整洁</Paragraph>
                  </div>
                </Col>
              </Row>
            </div>

            <Divider />

            <div className="function-notes">
              <div className="notes-header">
                <WarningOutlined className="notes-icon" />
                <Title level={4}>注意事项</Title>
              </div>
              <ul className="notes-list">
                <li><Text strong>权限说明：</Text> 游客只能查看账户信息和任务类型，管理员可以修改所有设置</li>
                <li><Text strong>默认账号：</Text> 管理员默认账号密码均为admin，可在登录弹窗中快速登录</li>
                <li><Text strong>类型关联：</Text> 删除任务类型不会影响已创建的任务，但新建任务时不会显示该类型</li>
                <li><Text strong>颜色要求：</Text> 任务类型颜色建议使用高对比度颜色，便于在甘特图中清晰识别</li>
                <li><Text strong>数据同步：</Text> 所有设置修改实时保存到服务器，多端访问数据保持一致</li>
                <li><Text strong>类型限制：</Text> 建议任务类型数量不超过10个，过多会影响使用体验</li>
              </ul>
            </div>
          </Space>
        </Card>

        <Card title="8. 常见问题" className="guide-section" variant="borderless">
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div className="faq-item">
              <Text strong>Q: 如何切换管理员身份？</Text>
              <Paragraph type="secondary">
                A: 点击右上角头像，选择「管理员一键登录」即可。默认账号密码均为admin。
              </Paragraph>
            </div>
            <div className="faq-item">
              <Text strong>Q: 数据会丢失吗？</Text>
              <Paragraph type="secondary">
                A: 数据实时保存到服务器，不会因浏览器关闭而丢失。建议定期导出数据备份。
              </Paragraph>
            </div>
            <div className="faq-item">
              <Text strong>Q: 如何导出数据？</Text>
              <Paragraph type="secondary">
                A: 进入「数据管理」页面，切换到「导入导出」标签，点击「导出数据」按钮，选择Excel或JSON格式。
              </Paragraph>
            </div>
            <div className="faq-item">
              <Text strong>Q: 如何导入数据？</Text>
              <Paragraph type="secondary">
                A: 进入「数据管理」页面，切换到「导入导出」标签，点击「导入数据」按钮，选择Excel或JSON文件。
              </Paragraph>
            </div>
            <div className="faq-item">
              <Text strong>Q: 游客和管理员有什么区别？</Text>
              <Paragraph type="secondary">
                A: 游客只能查看数据，无法修改；管理员可以创建、编辑、删除项目和任务，修改系统设置。
              </Paragraph>
            </div>
            <div className="faq-item">
              <Text strong>Q: 项目状态如何计算？</Text>
              <Paragraph type="secondary">
                A: 项目状态根据任务进度和日期自动计算。正常：按计划推进；风险：存在延期风险；延期：已超过计划时间。
              </Paragraph>
            </div>
            <div className="faq-item">
              <Text strong>Q: 如何查看历史记录？</Text>
              <Paragraph type="secondary">
                A: 在项目详情页点击任务条右侧的「历史」按钮，或在数据管理页面的「历史记录」标签查看。
              </Paragraph>
            </div>
            <div className="faq-item">
              <Text strong>Q: 甘特图支持多长时间范围？</Text>
              <Paragraph type="secondary">
                A: 甘特图支持120天超长日期轴，可通过上个月/今天/下个月按钮或左右滑动浏览。
              </Paragraph>
            </div>
            <div className="faq-item">
              <Text strong>Q: 如何自定义任务类型？</Text>
              <Paragraph type="secondary">
                A: 进入「设置中心」，在任务类型管理区域点击「新增任务类型」，填写名称和颜色后保存。
              </Paragraph>
            </div>
            <div className="faq-item">
              <Text strong>Q: 数据保存在哪里？</Text>
              <Paragraph type="secondary">
                A: 所有数据实时保存到服务器，通过/api/data接口持久化。多端访问同一服务器时数据保持一致。
              </Paragraph>
            </div>
          </Space>
        </Card>
      </div>
    </div>
  )
}

export default UserGuidePage