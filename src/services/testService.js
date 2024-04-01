import { collection, doc, getDocs, getFirestore } from "./firebase";

const testMetaData = {
  engineering: {
    queryCode: "engineering",
    name: "Engineering Test",
    displayType: "slider",
    evaluationType: "weighted-aggregation",
  },

  brain: {
    queryCode: "brain",
    name: "Brain Test",
    displayType: "mcq",
    evaluationType: "single-option",
  },

  interest: {
    queryCode: "interest",
    name: "Interest Test",
    displayType: "mcq",
    evaluationType: "aggregation",
  },

  iq: {
    queryCode: "iq",
    name: "IQ Test",
    displayType: "img-mcq",
    evaluationType: "single-option",
  },

  personality: {
    queryCode: "personality",
    name: "Personality Test",
    displayType: "mcq",
    evaluationType: "aggregation",
  },

  stream: {
    queryCode: "stream",
    name: "Stream Test",
    displayType: "mcq",
    evaluationType: "aggregation",
  },

  strength: {
    queryCode: "strength",
    name: "Strength Test",
    displayType: "mcq",
    evaluationType: "aggregation",
  },

  vark: {
    queryCode: "vark",
    name: "VARK Test",
    displayType: "mcq",
    evaluationType: "aggregation",
  },

  english: {
    queryCode: "english",
    name: "English Test",
    displayType: "mcq",
    evaluationType: "single-option",
  },
};

const db = getFirestore();

const getTestLogo = (testName) => {
  return testMetaData[testName].logo;
};

const getTestMetaData = (testName) => {
  return testMetaData[testName];
};

const getDefaultProfilePic = () => {
  return defaultUserPic;
};

const getRemainingTests = (excludedTests) => {
  const filteredTests = Object.keys(testMetaData)
    .filter(
      (testKey) =>
        !excludedTests.some(
          (excludedTest) =>
            excludedTest["test-name"].toLowerCase() ===
            testMetaData[testKey].name.toLowerCase()
        )
    )
    .map((testKey) => testMetaData[testKey]);

  return filteredTests;
};

async function getTestQuestions(testName) {
  try {
    const testQuestionsCollection = collection(db, "test-content");
    const testQuestionsDocRef = doc(testQuestionsCollection, testName);
    const contentCollection = collection(testQuestionsDocRef, "questions");

    const querySnapshot = await getDocs(contentCollection);
    const questions = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        question: data.question,
        options: Object.entries(data.options).map(([key, value]) => ({
          id: key,
          text: value,
        })),
      };
    });

    return questions;
  } catch (error) {
    console.error("Error retrieving questions:", error);
    throw error;
  }
}

async function evaluteTest(testName, selectedOptions) {
  const evaluationType = getTestMetaData(testName).evaluationType;
  try {
    const testQuestionsCollection = collection(db, "test-content");
    const testQuestionsDocRef = doc(testQuestionsCollection, testName);
    const answerKeyCollection = collection(testQuestionsDocRef, "answer-key");

    // Fetch the entire answer key
    const answerKeySnapshot = await getDocs(answerKeyCollection);

    if (evaluationType == "aggregation") {
      const answerKey = {};
      const results = {};
      answerKeySnapshot.forEach((doc) => {
        answerKey[doc.id] = doc.data();
      });
      for (let [questionId, optionId] of Object.entries(selectedOptions)) {
        const weights = answerKey[questionId];
        if (weights) {
          const optionWeight = weights[optionId];
          if (optionWeight) {
            Object.keys(optionWeight).forEach((weight) => {
              if (results[weight]) results[weight] += optionWeight[weight];
              else results[weight] = optionWeight[weight];
            });
          }
        } else {
          console.warn(`Answer key not found for question ${questionId}`);
        }
      }
      return results;
    } else if (evaluationType == "single-option") {
      let correctAnswers = 0;
      const answerKey = answerKeySnapshot.docs[0].data();
      for (let [questionId, optionId] of Object.entries(selectedOptions)) {
        if (optionId === answerKey[questionId]) correctAnswers += 1;
      }

      return correctAnswers;
    }

    if (evaluationType == "weighted-aggregation") {
      const answerKey = {};
      const results = {};
      answerKeySnapshot.forEach((doc) => {
        answerKey[doc.id] = doc.data();
      });
      for (let [questionId, selectedWeight] of Object.entries(
        selectedOptions
      )) {
        const weights = answerKey[questionId];
        if (weights) {
          const optionWeight = weights;
          if (optionWeight) {
            Object.keys(optionWeight).forEach((weight) => {
              if (results[weight])
                results[weight] += selectedWeight * optionWeight[weight];
              else results[weight] = selectedWeight * optionWeight[weight];
            });
          }
        } else {
          console.warn(`Answer key not found for question ${questionId}`);
        }
      }
      return results;
    }
  } catch (error) {
    console.error("Error calculating total score:", error);
    throw error;
  }
}

export {
  testMetaData,
  getTestMetaData,
  getTestLogo,
  getRemainingTests,
  getDefaultProfilePic,
  getTestQuestions,
  evaluteTest,
};
