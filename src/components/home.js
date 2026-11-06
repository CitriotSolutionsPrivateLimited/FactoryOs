import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Layout, Menu, message } from 'antd';
import {
    AppstoreOutlined,
    ThunderboltOutlined,
    ScanOutlined,
    VideoCameraOutlined,
    ApiOutlined,
} from '@ant-design/icons';
import useScreenType from 'react-screentype-hook';
import PrivateRoute from '../layouts/PrivateRoute';
import Dashboard from './dashboard';
import Cognisense from './cognisense/cognisense';
import AddMachine from './cognisense/addmachine';
import CognivisionInspect from './cognivisionInspect';
import CognivisionInsight from './cognivisionInsights';
import AgentsIntegrations from './agentsIntegration';

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

const ComingSoon = ({ title }) => (
    <div className="p-6 text-sm text-slate-500">{title} page is not built yet.</div>
);

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
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState([]);
    const [collapsed, setCollapsed] = useState(false);
    const [isFirstLogin, setIsFirstLogin] = useState(false);

    const screenType = useScreenType();
    const navigate = useNavigate();
    const citriot = JSON.parse(localStorage.getItem('citriot'));
    const firstName = localStorage.getItem('firstName');

    function getItem(label, key, icon, children, className) {
        return { key, icon, children, label, className };
    }

    useEffect(() => {
        // Check if this is first login
        const hasVisitedBefore = localStorage.getItem('hasVisitedBefore');
        if (!hasVisitedBefore) {
            setIsFirstLogin(true);
            localStorage.setItem('hasVisitedBefore', 'true');
        }
    }, []);

    useEffect(() => {
        const getOrganisations = async () => {
            try {
                setLoading(true);

                const tempItems = [
                    getItem('Overview', `${path}/dashboard`, <AppstoreOutlined style={{ color: COLORS.overview }} />),
                    getItem('CogniSense', `${path}/cognisense`, <ThunderboltOutlined style={{ color: COLORS.sense }} />),
                    getItem('CogniVision Inspect', `${path}/cognivision-inspect`, <ScanOutlined style={{ color: COLORS.inspect }} />),
                    getItem('CogniVision Insight', `${path}/cognivision-insight`, <VideoCameraOutlined style={{ color: COLORS.insight }} />),
                    getItem('Agents and integrations', `${path}/agents-integrations`, <ApiOutlined style={{ color: COLORS.agents }} />),
                ];

                setItems(tempItems);
                setLoading(false);
            } catch (err) {
                setLoading(false);
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

    return (
        <>
            {/* Menu styling that matches the Overview design */}
            <style>{`
                .factory-menu.ant-menu { background: transparent; border-inline-end: 0 !important; }
                .factory-menu .ant-menu-item {
                    height: 40px; line-height: 40px; margin: 2px 0; border-radius: 8px;
                    color: #475569; font-size: 13.5px;
                }
                .factory-menu .ant-menu-item:hover { background: #f8fafc !important; color: #0f172a !important; }
                .factory-menu .ant-menu-item-selected {
                    background: #f1f5f9 !important; color: #0f172a !important; font-weight: 600;
                }
                .factory-menu.ant-menu-inline-collapsed > .ant-menu-item { padding-inline: calc(50% - 8px); }
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
                        <div className="flex min-h-full flex-col px-2 pb-2">
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
                                onSelect={({ key }) => {
                                    navigate(key);
                                    setSelectedMenu([key]);
                                }}
                                defaultSelectedKeys={['/home/dashboard']}
                                items={items}
                            />
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
                            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                            <Route path="/cognisense" element={<PrivateRoute><Cognisense /></PrivateRoute>} />
                            <Route path="/cognisense/addmachine" element={<PrivateRoute><AddMachine /></PrivateRoute>} />
                            <Route path="/cognivision-inspect" element={<PrivateRoute><CognivisionInspect /></PrivateRoute>} />
                            <Route path="/cognivision-insight" element={<PrivateRoute><CognivisionInsight /></PrivateRoute>} />
                            <Route path="/agents-integrations" element={<PrivateRoute><AgentsIntegrations /></PrivateRoute>} />
                        </Routes>
                    </Content>
                </Layout>
            </Layout>
        </>
    );
};

export default Home;