import React, { useEffect, useState } from 'react';
import '@/styles/operations/operations.css'
import BranchStorage from '@/components/BranchStorage'
import OperationsNav from '@/components/OperationsNav'
import { Card, CardContent } from '@/components/ui/card'

import OpServiceQueue from '@/pages/operations/operations-sub-tab/OpServiceQueue'
import OpReadyDelivery from '@/pages/operations/operations-sub-tab/OpReadyDelivery'
import OpBranchDelivery from '@/pages/operations/operations-sub-tab/OpBranchDelivery'
import OpWarehouse from '@/pages/operations/operations-sub-tab/OpWarehouse'
import OpReturnBranch from '@/pages/operations/operations-sub-tab/OpReturnBranch'
import OpInStore from '@/pages/operations/operations-sub-tab/OpInStore'
import OpPickup from '@/pages/operations/operations-sub-tab/OpPickup'

export default function Operations() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showAdminUpper, setShowAdminUpper] = useState(true);
  const [fillHeight, setFillHeight] = useState("455px");

  const calculateFillHeight = () => {
    let height = "455px";
    const width = window.innerWidth;

    if (showAdminUpper) {
      if (width <= 534) height = "365px";
      else if (width <= 638) height = "385px";
      else if (width <= 898) height = "415px";
      else if (width <= 1088) height = "440px";
    } else {
      if (width <= 534) height = "250px";
      else if (width <= 638) height = "270px";
      else if (width <= 1088) height = "290px";
      else height = "300px";
    }

    setFillHeight(height);
  };

  useEffect(() => {
    calculateFillHeight(); // initial calculation

    const handleResize = () => {
      calculateFillHeight();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize); // cleanup
    };
  }, [showAdminUpper]); // recalc if showAdminUpper changes

  return (
    <div 
    className='main-div'
    style={{ "--fillheight": fillHeight } as React.CSSProperties}
    >
      {showAdminUpper && ( // conditional rendering
        <div className='admin-upper'>
          <BranchStorage />
        </div>
      )}

      <div className='main-content'>
        <Card className='rounded-3xl main-card'>
          <CardContent>
            <OperationsNav onChange={setActiveIndex} />

            {/* Render tab content dynamically */}
            <div className="tab-content">
              {activeIndex === 0 && <div><OpServiceQueue /></div>}
              {activeIndex === 1 && <div><OpReadyDelivery /></div>}
              {activeIndex === 2 && <div><OpBranchDelivery /></div>}
              {activeIndex === 3 && <div><OpWarehouse /></div>}
              {activeIndex === 4 && <div><OpReturnBranch /></div>}
              {activeIndex === 5 && <div><OpInStore /></div>}
              {activeIndex === 6 && <div><OpPickup /></div>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
