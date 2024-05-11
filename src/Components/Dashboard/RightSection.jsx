import DashboardBackground from "./../../assets/DashboardBackground.svg";
import { CreditsRemainingCard } from "./CreditsRemainingCard";
import { TestsTakenCard } from "./TestsTakenCard";
import "./BreathingAnimation.css";
import { RecommendedTests } from "./RecommendedTests";
import { useEffect, useState } from "react";
import { getRemainingTests, getTestLogo } from "../../services/testService";
import { getTestHistory } from "../../services/userService";
import { TestHistory } from "./TestHistory";

export const RightSection = () => {
  const [testHistory, setTestHistory] = useState([]);
  const [recommendedTests, setRecommendedTests] = useState([]);

  useEffect(() => {
    async function fetchTestHistory() {
      const testHistoryTemp = await getTestHistory();
      console.log("Fetched test history:", testHistoryTemp);
      //console.log("0", testHistoryTemp[0]["test-name"]);
      const remainigTemp = getRemainingTests(testHistoryTemp);
      console.log("Fetched remaining tests:", remainigTemp);
      setRecommendedTests(remainigTemp);
      console.log("Remaining test", remainigTemp);
      setTestHistory(testHistoryTemp);
    }

    fetchTestHistory();
  }, []);

  return (
    <div>
      <div className="w-[100vw] lg:w-[calc(100vw-18em)] flex flex-col">
        <div className="bg-gradient-to-b from-[#e9f3fc] to-white  lg:bg-gradient-to-b lg:from-[#CBE1F6] lg:to-white z-0 ">
          <div className="flex justify-between">
            <div className="hidden w-[20%] lg:flex text-xl sm:text-6xl items-center flex-row sm:flex-col justify-center mt-5 sm:mt-0">
              <h1 className="  font-extralight ml-0 md:ml-[-30px] ">Hello</h1>
              <h1 className=" font-semibold">There!</h1>
            </div>
            <img
              src={DashboardBackground}
              className="hidden lg:block md:h-[20em] animate-breathing mt-5 -ml-28"
              alt="Dashboard Background"
            />
            <div className="hidden  lg:flex items-end flex-col py-5 ">
              <CreditsRemainingCard />
              <TestsTakenCard />
            </div>
          </div>
          <div className="hidden lg:flex justify-between">
            <hr className="border border-[#c2d6fd] my-4 w-44"></hr>
            <hr className="border border-[#c2d6fd] my-4 w-44"></hr>
          </div>

          <div className="  lg:hidden  flex py-5 justify-center">
            <CreditsRemainingCard />
            <TestsTakenCard />
          </div>

          <RecommendedTests recommendedTests={recommendedTests} />
          {/* <TestHistory testHistory={testHistory} /> */}
        </div>
        <TestHistory testHistory={testHistory} />
      </div>
    </div>
  );
};
