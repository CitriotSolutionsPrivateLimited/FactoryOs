import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, message } from 'antd';
import {
    AppstoreOutlined,
    ThunderboltOutlined,
    ScanOutlined,
    VideoCameraOutlined,
    ApiOutlined,
    DashboardOutlined,
    ToolOutlined,
    FileTextOutlined,
    BarChartOutlined,
    ExperimentOutlined,
    LogoutOutlined,
} from '@ant-design/icons';
import useScreenType from 'react-screentype-hook';
import PrivateRoute from '../layouts/PrivateRoute';
import Dashboard from './dashboard';
import Cognisense from './cognisense/cognisense';
import AddMachine from './cognisense/addmachine';
import CognivisionInspect from './cognivisionInspect';
import CognivisionInsight from './cognivision/cognivisionInsights';
import AgentsIntegrations from './agentsIntegration';
import WordOrder from './cognisense/workorder';
import ModalTrain from './cognivision/modalTrain';

const { Content, Sider } = Layout;


const LOGO_SRC = '/citriotlogo.jpeg'; // file must be in your /public folder

// Colours match the Overview page (CogniSense teal, Inspect amber, Insight violet)
const COLORS = {
    overview: '#64748b',
    sense: '#0d9488',
    inspect: '#d97706',
    insight: '#7c3aed',
    agents: '#64748b',
};

// Keys of the parent menus (they only expand/collapse, they have no page of their own)
const SENSE_GROUP_KEY = 'cognisense-group';
const INSIGHT_GROUP_KEY = 'cognivision-insight-group';

/* Citriot logo for the sidebar. Falls back to a "C" badge if the image can't load. */
const BrandLogo = () => {
    const [imgFailed, setImgFailed] = useState(false);

    if (imgFailed) {
        return (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-600 text-sm font-bold text-white">
                C
            </span>
        );
    }

    return (
        <img
            src={LOGO_SRC}
            alt="Citriot logo"
            onError={() => setImgFailed(true)}
            className="h-8 w-8 shrink-0 rounded-lg bg-white object-contain p-0.5 ring-1 ring-slate-200"
        />
    );
};

const Home = ({ path }) => {
    const [selectedMenu, setSelectedMenu] = useState([]);
    const [openKeys, setOpenKeys] = useState([]);
    const [items, setItems] = useState([]);
    const [collapsed, setCollapsed] = useState(false);

    const screenType = useScreenType();
    const navigate = useNavigate();
    const location = useLocation();

    const performLogout = () => {
        // Clear login session
        const keysToRemove = [
            'token',
            'accessToken',
            'refreshToken',
            'authToken',
            'user',
            'isLoggedIn',
            'firstName'
        ];
        console.log("hii")

        keysToRemove.forEach((key) => {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
        });

        message.success('Logged out successfully');

        // Redirect directly to login
        navigate('/login', { replace: true });
    };

    function getItem(label, key, icon, children, className) {
        return { key, icon, children, label, className };
    }

    useEffect(() => {
        const getOrganisations = async () => {
            try {
                const tempItems = [
                    getItem('Overview', `${path}/dashboard`, <AppstoreOutlined style={{ color: COLORS.overview }} />),

                    // CogniSense: 3 sub modules
                    getItem(
                        'CogniSense',
                        SENSE_GROUP_KEY,
                        <ThunderboltOutlined style={{ color: COLORS.sense }} />,
                        [
                            getItem('Cognisense', `${path}/cognisense`, <DashboardOutlined style={{ color: COLORS.sense }} />),
                            getItem('Machines', `${path}/cognisense/addmachine`, <ToolOutlined style={{ color: COLORS.sense }} />),
                            getItem('Work Order', `${path}/cognisense/workorder`, <FileTextOutlined style={{ color: COLORS.sense }} />),
                        ]
                    ),

                    getItem('CogniVision Inspect', `${path}/cognivision-inspect`, <ScanOutlined style={{ color: COLORS.inspect }} />),

                    // CogniVision Insight: 2 sub modules
                    getItem(
                        'CogniVision Insight',
                        INSIGHT_GROUP_KEY,
                        <VideoCameraOutlined style={{ color: COLORS.insight }} />,
                        [
                            getItem('Insights', `${path}/cognivision-insight`, <BarChartOutlined style={{ color: COLORS.insight }} />),
                            getItem('Model Train', `${path}/cognivision-insight/modeltrain`, <ExperimentOutlined style={{ color: COLORS.insight }} />),
                        ]
                    ),

                    getItem('Agents and integrations', `${path}/agents-integrations`, <ApiOutlined style={{ color: COLORS.agents }} />),
                ];

                setItems(tempItems);
            } catch (err) {
                message.error(err.response?.data?.msg || 'Something went wrong');
            }
        };

        getOrganisations();

        const currentPath = window.location.pathname;
        if (currentPath === '/home') {
            navigate(`${path}/dashboard`);
            setSelectedMenu([`${path}/dashboard`]);
        } else {
            setSelectedMenu([currentPath]);
        }
    }, [path, navigate]);

    useEffect(() => {
        const current = location.pathname.replace(/\/+$/, '');
        if (current && current !== path) {
            setSelectedMenu([current]);
        }

        const groupsToOpen = [];
        if (current.startsWith(`${path}/cognisense`)) groupsToOpen.push(SENSE_GROUP_KEY);
        if (current.startsWith(`${path}/cognivision-insight`)) groupsToOpen.push(INSIGHT_GROUP_KEY);

        if (groupsToOpen.length) {
            setOpenKeys((prev) => Array.from(new Set([...prev, ...groupsToOpen])));
        }
    }, [location.pathname, path]);

    return (
        <>
            {/* Menu styling that matches the Overview design */}
            <style>{`
                .factory-menu.ant-menu { background: transparent; border-inline-end: 0 !important; }
                .factory-menu .ant-menu-item,
                .factory-menu .ant-menu-submenu-title {
                    height: 40px; line-height: 40px; margin: 2px 0; border-radius: 8px;
                    color: #475569; font-size: 13.5px;
                }
                .factory-menu .ant-menu-item:hover,
                .factory-menu .ant-menu-submenu-title:hover { background: #f8fafc !important; color: #0f172a !important; }
                .factory-menu .ant-menu-item-selected {
                    background: #f1f5f9 !important; color: #0f172a !important; font-weight: 600;
                }
                .factory-menu .ant-menu-sub.ant-menu-inline { background: transparent; }
                .factory-menu .ant-menu-submenu-selected > .ant-menu-submenu-title { color: #0f172a; font-weight: 600; }
                .factory-menu.ant-menu-inline-collapsed > .ant-menu-item,
                .factory-menu.ant-menu-inline-collapsed > .ant-menu-submenu > .ant-menu-submenu-title {
                    padding-inline: calc(50% - 8px);
                }

                /* Logout button pinned at the bottom of the sidebar */
                .logout-btn {
                    display: flex; align-items: center; gap: 10px;
                    width: 100%; height: 40px; padding: 0 16px;
                    border: 0; border-radius: 8px; background: transparent;
                    color: #475569; font-size: 13.5px; cursor: pointer;
                    transition: background 0.15s, color 0.15s;
                }
                .logout-btn:hover { background: #fef2f2; color: #dc2626; }
                .logout-btn.is-collapsed { justify-content: center; padding: 0; }
                .logout-btn .anticon { font-size: 16px; }
            `}</style>

            <Layout>
                <Layout hasSider>
                    <Sider
                        collapsible
                        collapsed={collapsed}
                        onCollapse={setCollapsed}
                        breakpoint="lg"
                        className="bg-white"
                        width={screenType.isMobile ? 150 : 220}
                        collapsedWidth={screenType.isMobile ? 60 : 80}
                        theme="light"
                        style={{
                            position: 'fixed',
                            top: 6,
                            left: 0,
                            bottom: 0,
                            overflowY: 'auto',
                            borderRight: '1px solid #e2e8f0',
                        }}
                    >
                        {/* pb-14 leaves room for the collapse trigger that antd draws at the very bottom */}
                        <div className="flex min-h-full flex-col px-2 pb-4">
                            {/* Brand block */}
                            <div className={`flex items-center gap-2.5 px-2 pb-4 pt-2 ${collapsed ? 'justify-center' : ''}`}>
                                <BrandLogo />
                                {!collapsed && (
                                    <div className="leading-tight">
                                        <p className="text-[17px] font-semibold text-slate-900">Factory OS</p>
                                        <p className="text-[11px] text-slate-400">Citriot</p>
                                    </div>
                                )}
                            </div>

                            <Menu
                                className="factory-menu"
                                mode="inline"
                                selectedKeys={selectedMenu}
                                openKeys={collapsed ? undefined : openKeys}
                                onOpenChange={setOpenKeys}
                                onSelect={({ key }) => {
                                    navigate(key);
                                    setSelectedMenu([key]);
                                }}
                                defaultSelectedKeys={['/home/dashboard']}
                                items={items}
                            />

                            {/* Logout – pushed to the bottom with mt-auto */}
                            <div className="mt-auto border-t border-slate-200 pt-2">
                                <button
                                    type="button"
                                    onClick={performLogout}
                                    title="Logout"
                                    className={`logout-btn ${collapsed ? 'is-collapsed' : ''}`}
                                >
                                    <LogoutOutlined />
                                    {!collapsed && <span>Logout</span>}
                                </button>
                            </div>
                        </div>
                    </Sider>

                    <Content
                        className="bg-[#F7FAFC]"
                        style={{
                            marginLeft: collapsed
                                ? (screenType.isMobile ? 60 : 80)
                                : (screenType.isMobile ? 150 : 220),
                            padding: screenType.isMobile ? '8px' : '24px 30px',
                            paddingTop: screenType.isMobile ? '8px' : '24px',
                            minHeight: '100vh',
                            width: '100%',
                        }}
                    >
                        <Routes>
                            {/* Dashboard */}
                            <Route
                                path="dashboard"
                                element={
                                    <PrivateRoute>
                                        <Dashboard />
                                    </PrivateRoute>
                                }
                            />

                            {/* CogniSense */}
                            <Route
                                path="cognisense"
                                element={
                                    <PrivateRoute>
                                        <Cognisense />
                                    </PrivateRoute>
                                }
                            />

                            <Route
                                path="cognisense/addmachine"
                                element={
                                    <PrivateRoute>
                                        <AddMachine />
                                    </PrivateRoute>
                                }
                            />

                            <Route
                                path="cognisense/workorder"
                                element={
                                    <PrivateRoute>
                                        <WordOrder />
                                    </PrivateRoute>
                                }
                            />

                            {/* CogniVision Inspect */}
                            <Route
                                path="cognivision-inspect"
                                element={
                                    <PrivateRoute>
                                        <CognivisionInspect />
                                    </PrivateRoute>
                                }
                            />

                            {/* CogniVision Insight */}
                            <Route
                                path="cognivision-insight"
                                element={
                                    <PrivateRoute>
                                        <CognivisionInsight />
                                    </PrivateRoute>
                                }
                            />

                            <Route
                                path="cognivision-insight/modeltrain"
                                element={
                                    <PrivateRoute>
                                        <ModalTrain />
                                    </PrivateRoute>
                                }
                            />

                            {/* Agents and Integrations */}
                            <Route
                                path="agents-integrations"
                                element={
                                    <PrivateRoute>
                                        <AgentsIntegrations />
                                    </PrivateRoute>
                                }
                            />
                        </Routes>
                    </Content>
                </Layout>
            </Layout>
        </>
    );
};

export default Home;