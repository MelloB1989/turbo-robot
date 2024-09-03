import type { MetaFunction } from "@remix-run/node";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useSubmit, useLoaderData } from "@remix-run/react";
import { calculateRevenueAndAffiliate } from "lib/calculate";
import { useState, useEffect } from "react";
import { BarChart } from "@saas-ui/charts";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";

const colors = {
  brand: {
    900: "#afcc54",
    800: "#3f3e45",
    700: "#5b5d62",
  },
};

const theme = extendTheme({ colors });

export const meta: MetaFunction = () => {
  return [
    { title: "Sunvoy Affiliate Revenue calculator." },
    { name: "description", content: "Sunvoy Affiliate Revenue calculator." },
  ];
};

const data = [
  {
    date: "Jan 1",
    Revenue: 1475,
  },
  {
    date: "Jan 8",
    Revenue: 1936,
  },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const referrals = parseInt(url.searchParams.get("referrals") ?? "1");
  const newProjects = parseInt(url.searchParams.get("newProjects") ?? "10");
  const existingProjects = parseInt(
    url.searchParams.get("existingProjects") ?? "2000"
  );

  const results = calculateRevenueAndAffiliate(
    referrals,
    newProjects,
    existingProjects
  );

  return json(results);
};

export default function Index() {
  const [referrals, setReferrals] = useState(1);
  const [newProjects, setNewProjects] = useState(10);
  const [existingProjects, setExistingProjects] = useState(2000);
  const [graphData, setGraphData] = useState(data); // Added state for graph data
  const loaderData: {
    month: number;
    existingCustomers: number;
    newCustomers: number;
    totalCustomers: number;
    existingProjects: number;
    revenue: number;
    affiliateRevenue: number;
  }[] = useLoaderData();
  const submit = useSubmit(); // Import and use useSubmit hook

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const currentMonthIndex = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const r: {
      date: string;
      Revenue: number;
    }[] = [];

    let monthIndex = currentMonthIndex;
    let year = currentYear;

    loaderData.forEach((d, i) => {
      const monthName = months[monthIndex];
      let label = monthName;

      if (i === 0) {
        label = `${monthName}
          ${year}`;
      } else if (monthIndex === 0 && i !== 0) {
        year += 1;
        label = `${monthName}
          ${year}`;
      }

      r.push({
        date: label,
        Revenue: d.affiliateRevenue,
      });
      monthIndex = (monthIndex + 1) % 12;
    });

    setGraphData(r);
  }, [loaderData]);

  const valueFormatter = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const form = e.currentTarget.form;
    if (form) {
      submit(form);
    }
  };

  return (
    <ChakraProvider theme={theme}>
      <div className="flex flex-col items-center justify-center w-full min-h-screen p-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          Calculate Your Recurring <br /> Passive Income
        </h1>
        <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-6xl">
          <div className="flex flex-col items-center md:items-start w-full max-w-lg space-y-4 md:mr-8">
            <p className="text-sm text-center md:text-left">
              Add in your expected referrals to see how much you could earn as a{" "}
              <strong>Sunvoy Affiliate</strong> in just 1 year
            </p>
            <Form method="get">
              <div className="space-y-2 w-full">
                <div className="flex items-center justify-between w-full text-center md:text-left">
                  <span className="text-sm">Referred Customers per month</span>
                  <span className="text-sm">
                    <strong>&nbsp;{referrals}</strong>
                  </span>
                </div>
                <input
                  type="range"
                  name="referrals"
                  min="1"
                  max="10"
                  value={referrals}
                  onChange={(e) => {
                    setReferrals(parseInt(e.target.value));
                    handleChange(e);
                  }}
                  className="w-full"
                />
              </div>
              <br />
              <div className="space-y-2 w-full">
                <div className="flex items-center justify-between w-full text-center md:text-left">
                  <span className="text-sm">Avg. new projects per month</span>
                  <span className="text-sm">
                    <strong>&nbsp;{newProjects}</strong>
                  </span>
                </div>
                <input
                  type="range"
                  name="newProjects"
                  min="5"
                  max="50"
                  onChange={(e) => {
                    setNewProjects(parseInt(e.target.value));
                    handleChange(e);
                  }}
                  value={newProjects}
                  className="w-full"
                />
              </div>
              <br />
              <div className="space-y-2 w-full">
                <div className="flex items-center justify-between w-full text-center md:text-left">
                  <span className="text-sm">Avg. existing projects</span>
                  <span className="text-sm">
                    <strong>&nbsp;{existingProjects}</strong>
                  </span>
                </div>
                <input
                  type="range"
                  name="existingProjects"
                  min="0"
                  max="10000"
                  onChange={(e) => {
                    setExistingProjects(parseInt(e.target.value));
                    handleChange(e);
                  }}
                  value={existingProjects}
                  className="w-full"
                />
              </div>
            </Form>
            <div className="mt-4 text-center md:text-left">
              <p className="text-sm">
                Your <strong>monthly income</strong> after 1 year:
              </p>
              <p className="text-4xl font-bold">
                $
                {graphData[graphData.length - 1]
                  ? graphData[graphData.length - 1].Revenue
                  : 0}
              </p>
            </div>
          </div>
          <div className="w-full md:w-[50%] mt-8 md:mt-0 flex justify-center">
            <div className="w-full h-full md:h-80">
              <BarChart
                data={graphData}
                categories={["Revenue"]}
                colors={["#afcc54"]}
                valueFormatter={valueFormatter}
                yAxisWidth={150} // Increase the width to accommodate longer labels
                height="300px"
              />
            </div>
          </div>
        </div>
      </div>
    </ChakraProvider>
  );
}
