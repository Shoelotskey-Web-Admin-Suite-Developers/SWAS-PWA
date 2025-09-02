import React, { useState } from 'react';
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

  let fillheight = "450px";

  if (showAdminUpper) {
    if (window.innerWidth <= 535) fillheight = "700px";
    else if (window.innerWidth <= 639) fillheight = "470px";
    else if (window.innerWidth <= 1088) fillheight = "430px";
  } else {
    if (window.innerWidth <= 535) fillheight = "460px";
    else if (window.innerWidth <= 639) fillheight = "420px";
    else if (window.innerWidth <= 1088) fillheight = "380px";
    else fillheight = "360px";
  }

  return (
    <div 
    className='main-div'
    style={{ "--fillheight": fillheight } as React.CSSProperties}
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
