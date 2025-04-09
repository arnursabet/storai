import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import WelcomeScreen from '../components/welcome/WelcomeScreen';
import EditorScreen from '../components/editor/EditorScreen';
import TemplateSelectionScreen from '../components/templates/TemplateSelectionScreen';
import { UploadScreen } from '../components/upload/UploadScreen';
import { SettingsScreen } from '../components/settings/SettingsScreen';
import FAQPage from '../components/faq/faq';

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomeScreen />} />
        <Route path="/editor" element={<EditorScreen />} />
        <Route path="/templates" element={<TemplateSelectionScreen />} />
        <Route path="/upload" element={<UploadScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes; 