import React, { useState } from 'react';
import styled from 'styled-components';
import aiTheme from '../styles/aiTheme';

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabNavigationProps {
  tabs: Tab[];
  defaultActiveTab?: string;
  onTabChange?: (tabId: string) => void;
}

const TabContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: transparent;
  border-radius: 20px;
  overflow: hidden;
`;

const TabHeader = styled.div`
  display: flex;
  background: ${aiTheme.glass.light};
  border-bottom: 1px solid ${aiTheme.colors.aiBlue}20;
  border-radius: ${aiTheme.borderRadius.xl} ${aiTheme.borderRadius.xl} 0 0;
  position: sticky;
  top: 0;
  z-index: 100;
  justify-content: flex-start;
  padding: 0.5rem 1rem;
  overflow-x: auto;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
  backdrop-filter: ${aiTheme.glass.blur};
  
  /* AI gradient border effect */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: ${aiTheme.gradients.neural};
  }
  
  /* Hide scrollbar */
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
  
  /* Desktop: Center if tabs fit */
  @media (min-width: 1200px) {
    justify-content: center;
  }
  
  /* Mobile: Always scrollable */
  @media (max-width: 768px) {
    padding: 0.25rem 0.5rem;
  }
`;

const TabButton = styled.button<{ $isActive: boolean }>`
  padding: 0.75rem 1.25rem;
  border: none;
  background: ${props => props.$isActive ? aiTheme.glass.medium : 'transparent'};
  color: ${props => props.$isActive ? aiTheme.colors.aiCyan : aiTheme.colors.textSecondary};
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all ${aiTheme.animations.duration.normal} ${aiTheme.animations.easing.smooth};
  border-radius: ${aiTheme.borderRadius.md};
  position: relative;
  flex-shrink: 0;
  white-space: nowrap;
  overflow: hidden;
  
  /* AI active indicator */
  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: ${aiTheme.gradients.neural};
    transform: scaleX(${props => props.$isActive ? 1 : 0});
    transition: transform ${aiTheme.animations.duration.normal} ${aiTheme.animations.easing.smooth};
  }
  
  /* AI glow effect */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: ${aiTheme.gradients.cyber};
    opacity: 0.1;
    transition: left 0.5s ease;
  }
  
  &:hover {
    background: ${props => props.$isActive ? aiTheme.glass.heavy : aiTheme.glass.light};
    color: ${props => props.$isActive ? aiTheme.colors.aiBlue : aiTheme.colors.text};
    transform: translateY(-1px);
    
    &::after {
      left: 100%;
    }
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${aiTheme.colors.aiBlue}50;
  }
  
  @media (max-width: 768px) {
    padding: 0.5rem 0.875rem;
    font-size: 0.75rem;
  }
  
  @media (min-width: 1200px) {
    padding: 0.75rem 1.5rem;
    font-size: 0.9rem;
  }
`;

const TabContent = styled.div`
  flex: 1;
  overflow-y: auto;
  position: relative;
  background-color: rgba(255, 255, 255, 0.01);
  border-radius: 0 0 20px 20px;
`;



const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  defaultActiveTab,
  onTabChange
}) => {
  const [activeTab, setActiveTab] = useState(defaultActiveTab || tabs[0]?.id || '');

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <TabContainer>
      <TabHeader>
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            $isActive={activeTab === tab.id}
            onClick={() => handleTabClick(tab.id)}
            aria-selected={activeTab === tab.id}
            role="tab"
          >
            {tab.label}
          </TabButton>
        ))}

      </TabHeader>

      <TabContent role="tabpanel">
        {activeTabContent}
      </TabContent>
    </TabContainer>
  );
};

export default TabNavigation;