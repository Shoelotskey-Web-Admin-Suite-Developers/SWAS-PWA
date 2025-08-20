// src/pages/operations/operations.tsx
import React from 'react';
import '@/styles/operations/operations.css'
import BranchStorage from '@/components/BranchStorage'
import OperationsNav from '@/components/OperationsNav'
import { Card, CardContent } from '@/components/ui/card'

export default function Operations() {
  return (
    <div className='main-div'>
      <div className='admin-upper'>
        <BranchStorage />
      </div>

      <div className='main-content'>
        <Card className='main-card'>
          <CardContent>
            <OperationsNav />
            
            <h1 className='h1-sp1'>Fill</h1>
            <h1 className='h1-sp1'>Fill</h1>
            <h1 className='h1-sp1'>Fill</h1>
            <h1 className='h1-sp1'>Fill</h1>
            <h1 className='h1-sp1'>Fill</h1>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
