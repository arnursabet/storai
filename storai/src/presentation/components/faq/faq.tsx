import React, { useState } from 'react';
import LeftArrowButton from './larr';
import { useNavigate } from 'react-router-dom';

const FAQPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('General Use & Accessibility');

  const teal = '#009293';

  const categories = [
    {
      name: 'General Use & Accessibility',
      content: [
        {
          question: 'What customization options are available for note-taking formats?',
          answer: 'StorAI allows users to edit generated notes to better fit their needs through various formats such as SOAP. We are also working on introducing customizable note-taking formats and key phrases that allow users to create a more personalized experience for our user base.',
        },
        {
          question: 'Features we do not offer:',
          answer: 'Currently, we do not support voice-to-text functionality, offline mode, or collaborative features. This in response from our past therapist interviews that expressed anxieties and concerns regarding these tools. In alignment with these concerns, we will not provide these tools for the time being.',
        },
      ],
      get count(){
        return this.content.length;
      }
    },
    {
      name: 'Privacy & Security',
      content: [
        {
          question: 'How does the app comply with HIPAA and other data protection regulations?',
          answer: 'StorAI adheres to HIPAA guidelines and strives to exceed these standards by implementing additional data protection frameworks to ensure the highest level of security for our users.',
        },
        {
          question: 'What patient information is anonymized when using the AI?',
          answer: 'Our AI does not collect any identifiable patient data, ensuring that any information processed is anonymized and treated with the utmost confidentiality.',
        },
        {
          question: 'Where is my data stored, and for how long?',
          answer: 'Data is locally stored until user chooses to delete.',
        },
        {
          question: 'Can I permanently delete my data from the system?',
          answer: 'Yes, you can permanently delete your data from our system at any time.',
        },
        {
          question: 'How does the app handle data breaches, and when will I be notified?',
          answer: 'In the event of a data breach, we will follow our established protocols to notify affected users promptly.',
        },
        {
          question: 'Does the app collect or store any personally identifiable information (PII) about me or my patients?',
          answer: 'We only store email login information. No data is stored or collected.',
        },
      ],
      get count(){
        return this.content.length;
      }
    },
    {
      name: 'User Consent & Control',
      content: [
        {
          question: 'Do I need to opt in before using AI-generated notes?',
          answer: 'Yes. StorAI believes in the opt-out model: users are asked to confirm opt-in before application use to ensure transparency and control over AI.',
        },
        {
          question: 'Can I change my privacy settings after I start using the app?',
          answer: 'Yes, you can modify your privacy settings at any time through the settings function.',
        },
      ],
      get count(){
        return this.content.length;
      }
    },
    {
      name: 'Integration & Collaboration',
      content: [
        {
          question: 'Can I share AI-generated notes with other healthcare professionals?',
          answer: 'Currently no. To avoid privacy and data risks of users, StorAI allows importing and exporting functions. If users wish to share notes, users must export these notes and share externally.',
        },
        {
          question: 'Does the app integrate with existing electronic health record (EHR) systems?',
          answer: 'No. StorAI is strictly a notetaking LLM tools. Based on the legal landscape of HIPAA and past mental app performances, StorAI will center on the protection of users.',
        },
        {
          question: 'Can I export my notes in different file formats?',
          answer: 'Yes. StorAI offers word, pdf, and text files as export options.',
        },
      ],
      get count(){
        return this.content.length;
      }
    },
  ];

  const selectedContent = categories.find(c => c.name === selectedCategory)?.content || [];

  return (
    <div className="h-screen flex font-sans">
      {/* Sidebar */}
      <div className="w-[340px] bg-white border-r border-gray-200 p-6">
      <LeftArrowButton 
          text="Return to Notes" 
          onClick={() =>  navigate('/editor')} 
          className="mb-4"
        />
        <h2 className="text-lg font-semibold mb-4">FAQ</h2>
        <div className="space-y-2">
          {categories.map((category) => {
            const isSelected = selectedCategory === category.name;
            return (
              <div
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className={`cursor-pointer px-4 py-3 rounded-lg flex justify-between items-start border transition-all duration-200 ${
                  isSelected
                    ? 'border' // keep tailwind border to maintain sizing
                    : 'hover:bg-gray-50 border-transparent'
                }`}
                style={{
                  backgroundColor: isSelected ? '#E6F4F3' : undefined, // subtle tint
                  borderColor: isSelected ? teal : 'transparent',
                }}
              >
                <div>
                  <div
                    className="font-medium text-base"
                    style={{ color: isSelected ? teal : '#1F2937' }} // gray-800
                  >
                    {category.name}
                  </div>
                </div>
                <div
                  className="text-xs font-semibold w-5 h-5 flex items-center justify-center rounded bg-gray-100"
                  style={{ color: isSelected ? teal : '#6B7280' }} // gray-500
                >
                  {category.count}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-gradient-to-b from-white to-[#E6F4F3] p-10 selection:bg-[#009293] selection:text-white overflow-y-auto">
      <h1 className="text-2xl font-semibold text-gray-800 mb-8">{selectedCategory}</h1>

        <div className="space-y-6">
          {selectedContent.map((item, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 shadow-sm rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.question}</h3>
              <p className="text-gray-700 text-base">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
