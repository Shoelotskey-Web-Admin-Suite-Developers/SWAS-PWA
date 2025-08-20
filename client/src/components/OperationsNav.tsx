import React from 'react';
import '@/styles/components/operationsNav.css'
import { Card, CardContent } from '@/components/ui/card'

import IconSQ from '@/assets/icons/op-service-queue.svg?react';



export default function OperationsNav() {
  return (
    <div className='main-wrapper'>
      <Card className='rounded-full card-nav'>
        <CardContent className='card-content'>
          <div className='card-items'></div>
          <div className='card-item chosen-item'>
            <IconSQ />
            <h6 className='regular'>Service Queue</h6>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}