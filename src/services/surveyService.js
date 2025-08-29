// Survey Service - Handles all survey-related API operations
export const surveyService = {
  // Get all available surveys for a user
  async getAvailableSurveys(userId) {
    try {
      const completed = JSON.parse(localStorage.getItem(`completedSurveys_${userId}`) || '[]');
      const allSurveys = this.getAllSurveys();
      return allSurveys.filter(survey => !completed.includes(survey.id));
    } catch (error) {
      console.error('Error getting available surveys:', error);
      return [];
    }
  },

  // Get completed surveys for a user
  async getCompletedSurveys(userId) {
    try {
      return JSON.parse(localStorage.getItem(`completedSurveys_${userId}`) || '[]');
    } catch (error) {
      console.error('Error getting completed surveys:', error);
      return [];
    }
  },

  // Mark survey as completed
  async completeSurvey(userId, surveyId, answers) {
    try {
      const completed = await this.getCompletedSurveys(userId);
      const newCompleted = [...completed, surveyId];
      localStorage.setItem(`completedSurveys_${userId}`, JSON.stringify(newCompleted));
      
      // Store survey answers (for analytics/reporting)
      const answerKey = `surveyAnswers_${userId}_${surveyId}`;
      localStorage.setItem(answerKey, JSON.stringify({
        surveyId,
        answers,
        completedAt: new Date().toISOString()
      }));
      
      return { success: true, message: 'Survey completed successfully' };
    } catch (error) {
      console.error('Error completing survey:', error);
      return { success: false, message: 'Failed to complete survey' };
    }
  },

  // Get survey by ID
  getSurveyById(surveyId) {
    const surveys = this.getAllSurveys();
    return surveys.find(survey => survey.id === surveyId);
  },

  // Get all survey definitions
  getAllSurveys() {
    return [
      {
        id: 'food-diary-001',
        title: 'Food Diary',
        description: 'Track your daily eating habits',
        reward: 12.00,
        timeEstimate: 'Time varies',
        category: 'lifestyle',
        icon: '🍽️',
        color: '#4285F4',
        questions: [
          {
            id: 1,
            question: 'How many meals do you eat per day?',
            type: 'multiple-choice',
            options: ['1-2 meals', '3 meals', '4-5 meals', 'More than 5 meals']
          },
          {
            id: 2,
            question: 'What time do you usually have breakfast?',
            type: 'multiple-choice',
            options: ['6:00-7:00 AM', '7:00-8:00 AM', '8:00-9:00 AM', 'I skip breakfast']
          },
          {
            id: 3,
            question: 'How often do you eat out per week?',
            type: 'multiple-choice',
            options: ['Never', '1-2 times', '3-4 times', '5+ times']
          },
          {
            id: 4,
            question: 'What motivates your food choices?',
            type: 'multiple-choice',
            options: ['Health', 'Taste', 'Convenience', 'Price', 'Social factors']
          }
        ]
      },
      {
        id: 'in-store-002',
        title: 'In-Store',
        description: 'Your shopping experience feedback',
        reward: 8.00,
        timeEstimate: '15 mins',
        category: 'shopping',
        icon: '🏪',
        color: '#34A853',
        questions: [
          {
            id: 1,
            question: 'How often do you shop in physical stores?',
            type: 'multiple-choice',
            options: ['Daily', 'Few times a week', 'Weekly', 'Monthly', 'Rarely']
          },
          {
            id: 2,
            question: 'What factors influence your store choice?',
            type: 'multiple-choice',
            options: ['Price', 'Location', 'Product quality', 'Brand reputation']
          },
          {
            id: 3,
            question: 'How important is customer service to you?',
            type: 'multiple-choice',
            options: ['Very important', 'Important', 'Somewhat important', 'Not important']
          }
        ]
      },
      {
        id: 'opinions-003',
        title: 'Opinions',
        description: 'Share your thoughts on current topics',
        reward: 1.50,
        timeEstimate: '10 mins',
        category: 'general',
        icon: '💭',
        color: '#00BFA5',
        questions: [
          {
            id: 1,
            question: 'How do you prefer to receive news?',
            type: 'multiple-choice',
            options: ['Social media', 'News websites', 'TV', 'Newspapers', 'Podcasts']
          },
          {
            id: 2,
            question: 'What social media platform do you use most?',
            type: 'multiple-choice',
            options: ['Facebook', 'Instagram', 'Twitter', 'TikTok', 'LinkedIn']
          }
        ]
      },
      {
        id: 'opinions-004',
        title: 'Opinions',
        description: 'Technology preferences survey',
        reward: 1.50,
        timeEstimate: '10 mins',
        category: 'tech',
        icon: '💭',
        color: '#00BFA5',
        questions: [
          {
            id: 1,
            question: 'Which smartphone brand do you prefer?',
            type: 'multiple-choice',
            options: ['iPhone', 'Samsung', 'Google Pixel', 'OnePlus', 'Other']
          },
          {
            id: 2,
            question: 'How important is battery life in a phone?',
            type: 'multiple-choice',
            options: ['Very important', 'Important', 'Somewhat important', 'Not important']
          }
        ]
      },
      {
        id: 'opinions-005',
        title: 'Opinions',
        description: 'Entertainment and media preferences',
        reward: 1.50,
        timeEstimate: '10 mins',
        category: 'entertainment',
        icon: '💭',
        color: '#00BFA5',
        questions: [
          {
            id: 1,
            question: 'What streaming service do you use most?',
            type: 'multiple-choice',
            options: ['Netflix', 'Amazon Prime', 'Disney+', 'Hulu', 'YouTube Premium']
          },
          {
            id: 2,
            question: 'How many hours do you watch TV/streaming per day?',
            type: 'multiple-choice',
            options: ['Less than 1 hour', '1-2 hours', '3-4 hours', '5+ hours']
          }
        ]
      },
      {
        id: 'opinions-006',
        title: 'Opinions',
        description: 'Travel and lifestyle survey',
        reward: 1.50,
        timeEstimate: '10 mins',
        category: 'travel',
        icon: '💭',
        color: '#00BFA5',
        questions: [
          {
            id: 1,
            question: 'How often do you travel for leisure?',
            type: 'multiple-choice',
            options: ['Multiple times a year', 'Once a year', 'Every few years', 'Rarely', 'Never']
          },
          {
            id: 2,
            question: 'What type of accommodation do you prefer?',
            type: 'multiple-choice',
            options: ['Hotels', 'Airbnb', 'Hostels', 'Friends/Family', 'Camping']
          }
        ]
      },
      // Additional surveys for variety
      {
        id: 'health-fitness-007',
        title: 'Health & Fitness',
        description: 'Your wellness and fitness habits',
        reward: 3.00,
        timeEstimate: '12 mins',
        category: 'health',
        icon: '💪',
        color: '#FF6B6B',
        questions: [
          {
            id: 1,
            question: 'How often do you exercise per week?',
            type: 'multiple-choice',
            options: ['Never', '1-2 times', '3-4 times', '5-6 times', 'Daily']
          },
          {
            id: 2,
            question: 'What type of exercise do you prefer?',
            type: 'multiple-choice',
            options: ['Cardio', 'Weight training', 'Yoga', 'Sports', 'Walking/Hiking']
          },
          {
            id: 3,
            question: 'How important is mental health to you?',
            type: 'multiple-choice',
            options: ['Very important', 'Important', 'Somewhat important', 'Not important']
          }
        ]
      },
      {
        id: 'finance-money-008',
        title: 'Finance & Money',
        description: 'Your financial habits and preferences',
        reward: 4.50,
        timeEstimate: '18 mins',
        category: 'finance',
        icon: '💳',
        color: '#9B59B6',
        questions: [
          {
            id: 1,
            question: 'How do you primarily manage your finances?',
            type: 'multiple-choice',
            options: ['Mobile banking app', 'Online banking', 'Traditional bank visits', 'Financial advisor']
          },
          {
            id: 2,
            question: 'What financial goal is most important to you?',
            type: 'multiple-choice',
            options: ['Emergency fund', 'Retirement savings', 'Investment growth', 'Debt reduction', 'Major purchase']
          },
          {
            id: 3,
            question: 'How comfortable are you with digital payments?',
            type: 'multiple-choice',
            options: ['Very comfortable', 'Comfortable', 'Somewhat comfortable', 'Not comfortable']
          }
        ]
      }
    ];
  },

  // Get user's survey statistics
  async getUserStats(userId) {
    try {
      const completed = await this.getCompletedSurveys(userId);
      const allSurveys = this.getAllSurveys();
      
      const totalEarnings = completed.reduce((total, surveyId) => {
        const survey = allSurveys.find(s => s.id === surveyId);
        return total + (survey ? survey.reward * 100 : 0); // Convert to coins
      }, 0);
      
      return {
        completedCount: completed.length,
        totalEarnings,
        availableCount: allSurveys.length - completed.length,
        completionRate: Math.round((completed.length / allSurveys.length) * 100)
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {
        completedCount: 0,
        totalEarnings: 0,
        availableCount: 0,
        completionRate: 0
      };
    }
  }
}; 