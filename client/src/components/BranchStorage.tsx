import React, { useState, useEffect } from 'react';
import '@/styles/components/branchStorage.css'
import { Card, CardContent } from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { getLineItemsByBranch } from '@/utils/api/getLineItemsByBranch';
import { getLineItemsByLocation } from '@/utils/api/getLineItemsByLocation';

type BranchData = {
  name: string;
  branchId: string;
  shoeCount: number;
  storageLeft: number;
};

type WarehouseData = {
  shoeCount: number;
  storageLeft: number;
};

const BRANCH_MAX_CAPACITY = 75;
const WAREHOUSE_MAX_CAPACITY = 250;

export default function BranchStorage() {
  const [branchData, setBranchData] = useState<BranchData[]>([
    { name: "SM Grand", branchId: "SMGRA-B-NCR", shoeCount: 0, storageLeft: 100 },
    { name: "SM Valenzuela", branchId: "SMVAL-B-NCR", shoeCount: 0, storageLeft: 100 },
    { name: "Valenzuela", branchId: "VAL-B-NCR", shoeCount: 0, storageLeft: 100 },
  ]);
  const [warehouseData, setWarehouseData] = useState<WarehouseData>({
    shoeCount: 0,
    storageLeft: 100,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStorageData = async () => {
      try {
        setLoading(true);

        // Fetch data for all branches
        const branchPromises = branchData.map(async (branch) => {
          const items = await getLineItemsByBranch(branch.branchId);
          
          // Only count items that are physically at the branch (current_location = "Branch")
          const itemsAtBranch = items.filter(item => item.current_location === "Branch");
          const shoeCount = itemsAtBranch.length;
          const storageLeft = Math.round(((BRANCH_MAX_CAPACITY - shoeCount) / BRANCH_MAX_CAPACITY) * 100);
          
          return {
            ...branch,
            shoeCount,
            storageLeft: Math.max(0, storageLeft), // Ensure it doesn't go below 0
          };
        });

        // Fetch warehouse data - only count items that are physically at the Hub
        const warehouseItems = await getLineItemsByLocation("Hub");
        const warehouseShoeCount = warehouseItems.length;
        const warehouseStorageLeft = Math.round(((WAREHOUSE_MAX_CAPACITY - warehouseShoeCount) / WAREHOUSE_MAX_CAPACITY) * 100);

        // Update state
        const updatedBranchData = await Promise.all(branchPromises);
        setBranchData(updatedBranchData);
        setWarehouseData({
          shoeCount: warehouseShoeCount,
          storageLeft: Math.max(0, warehouseStorageLeft), // Ensure it doesn't go below 0
        });

      } catch (error) {
        console.error("Error fetching storage data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStorageData();
  }, []);

  const renderBranchStats = (branch: BranchData) => (
    <div className='branch-storage-stats' key={branch.branchId}>
      <div className='upper-branch-stats'>
        <div className='branch-stats'>
          <h1 className='h1-sp1'>{loading ? "..." : branch.shoeCount}</h1>
          <h4 className='bold'>Shoes</h4>
        </div>
        <div className='branch-stats'>
          <h1 className='h1-sp1 regular'>{loading ? "..." : `${branch.storageLeft}%`}</h1>
          <h4 className='bold'>Storage Left</h4>
        </div>
      </div>
      <h4 className='bold'>{branch.name}</h4>
    </div>
  );

  const renderWarehouseStats = () => (
    <div className='branch-storage-stats'>
      <div className='upper-branch-stats'>
        <div className='branch-stats'>
          <h1 className='h1-sp1'>{loading ? "..." : warehouseData.shoeCount}</h1>
          <h4 className='bold'>Shoes</h4>
        </div>
        <div className='branch-stats'>
          <h1 className='h1-sp1 regular'>{loading ? "..." : `${warehouseData.storageLeft}%`}</h1>
          <h4 className='bold'>Storage Left</h4>
        </div>
      </div>
      <h4 className='bold'>Warehouse</h4>
    </div>
  );

  return (
    <div>
      <div className='pc-tablet'>
        <Card className='branch-card'>
          <CardContent className='op-branch-card-contents'>
            {branchData.map(renderBranchStats)}
            {renderWarehouseStats()}
          </CardContent>
        </Card>
      </div>

      <div className='landscape-mobile'>
        <Card className='mobile-card'>
          <CardContent>
            <Carousel className='carousel'>
              <CarouselContent>
                <CarouselItem className='carousel-item'>
                  {branchData.slice(0, 2).map(renderBranchStats)}
                </CarouselItem>
                <CarouselItem className='carousel-item'>
                  {renderBranchStats(branchData[2])}
                  {renderWarehouseStats()}
                </CarouselItem>
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </CardContent>
        </Card>
      </div>
      
      <div className='mobile'>
        <Card className='mobile-card'>
          <CardContent>
            <Carousel className='carousel'>
              <CarouselContent>
                {branchData.map(branch => (
                  <CarouselItem key={branch.branchId}>
                    {renderBranchStats(branch)}
                  </CarouselItem>
                ))}
                <CarouselItem>
                  {renderWarehouseStats()}
                </CarouselItem>
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}