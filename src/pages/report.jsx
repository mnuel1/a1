import React from 'react';
import { PieChart } from '@carbon/charts-react';
import '@carbon/charts/styles.css';

import ManifestTable from '../ui/table';
import Map from '../ui/map';
import ScheduleCalendar from '../ui/calendar';

import pieData from '../utils/pieData';
import pieOption from '../utils/pieOption';

const Report = ({ data }) => {
  return (
    <div className="flex h-full w-full">
      <main className="h-full w-full flex-1 p-6">
        <h2 className="text-2xl font-bold">Reports</h2>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold">NCR</h3>
            <div className="flex items-end">
              <p className="text-3xl font-bold">{data?.deliveries?.[0]?.count ?? 0}</p>
              <span className="text-sm font-medium ml-2">total boxes</span>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
            <h3 className="text-lg font-medium">Luzon</h3>
            <div className="flex items-end">
              <p className="text-3xl font-bold">{data?.deliveries?.[1]?.count ?? 0}</p>
              <span className="text-sm font-medium ml-2">total boxes</span>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
            <h3 className="text-lg font-medium">Visayas</h3>
            <div className="flex items-end">
              <p className="text-3xl font-bold">{data?.deliveries?.[2]?.count ?? 0}</p>
              <span className="text-sm font-medium ml-2">total boxes</span>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
            <h3 className="text-lg font-medium">Mindanao</h3>
            <div className="flex items-end">
              <p className="text-3xl font-bold">{data?.deliveries?.[3]?.count ?? 0}</p>
              <span className="text-sm font-medium ml-2">total boxes</span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
            <h3 className="mb-4 font-semibold text-lg">Generate Reports</h3>
            <ManifestTable />
          </div>

          <div className="rounded-lg bg-white p-6 shadow-md">
            <PieChart data={pieData} options={pieOption} />
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
            <ScheduleCalendar />
          </div>

          <div className="grow rounded-lg bg-white p-6 shadow-md">
            <Map />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Report;
