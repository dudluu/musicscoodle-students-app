// Direct Wix API integration without Supabase
const WIX_BASE_URL = 'https://www.musicscoodle.com/_functions-dev';

interface WixCredentials {
  email: string;
  name: string;
  studentId: string;
}

interface WixResponse {
  status: string;
  message?: string;
  sData?: WixCredentials[];
  options?: WixCredentials[];
}

export const getCredentials = async (email: string, password?: string): Promise<WixCredentials[]> => {
  try {
    console.log('Calling getCredentials with email:', email);
    
    const response = await fetch(`${WIX_BASE_URL}/appGetCredentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        email: email
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: WixResponse = await response.json();
    console.log('API response:', data);
    console.log('appGetCredentials response status:', data.status);
    console.log('appGetCredentials response data:', data.sData || data.options);

    // Handle 'ok', 'success', and 'multiple' status
    if ((data.status === 'ok' || data.status === 'success' || data.status === 'multiple') && (data.sData || data.options)) {
      const credentials = data.sData || data.options || [];
      console.log('Returning credentials:', credentials);
      return credentials;
    } else if (data.status === 'error') {
      throw new Error(data.message || 'Failed to get credentials');
    } else {
      console.log('No credentials found, returning empty array. Status:', data.status);
      return [];
    }
  } catch (error) {
    console.error('Error in getCredentials:', error);
    // Return mock data for development
    return [{
      email: "eveline.thut@i-netz.ch",
      name: "Test User", 
      studentId: "123"
    }];
  }
};


export const fetchWixData = async (endpoint: string, params: any = {}) => {
  try {
    const response = await fetch(`${WIX_BASE_URL}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`${endpoint} response:`, data);
    return data;
  } catch (error) {
    console.error(`Error calling ${endpoint}:`, error);
    throw error;
  }
};

export const fetchAppData = async (email: string, studentName: string, studentId?: string) => {
  try {
    // Get user's timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    console.log('User timezone:', timezone);
    
    console.log('Calling appData with:', { email, studentName, studentId, timezone });

    
    // Use 'name' instead of 'studentName' as expected by the API
    const requestBody = {
      email: email,
      name: studentName,
      timezone: timezone,
      ...(studentId && { studentId: studentId })
    };
    
    
    console.log('Request body for appData:', requestBody);
    
    const response = await fetch(`${WIX_BASE_URL}/appData`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('appData response status:', response.status);
    console.log('appData response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('appData error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const data = await response.json();
    console.log('appData response:', data);
    return data;
  } catch (error) {
    console.error('Error in fetchAppData:', error);
    throw error;
  }
};


export const savePassword = async (email: string, password: string) => {
  return fetchWixData('appSavePassword', { email, pw: password });
};

export const sendEmailToUser = async (email: string, subject: string, body: string, language: string) => {
  return fetchWixData('appSendEmailToUser', { email, subject, body, language });
};

export const appSaveLessonCancellation = async (sId: string, lessonData: any, passedAbsenzgrund: string, passedBemerkung: string, passedDeleteAbmeldung: boolean, lang: string) => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return fetchWixData('appSaveLessonCancellation', {
    sId,
    lessonData,
    passedAbsenzgrund,
    passedBemerkung,
    passedDeleteAbmeldung,
    lang,
    timezone
  });
};
