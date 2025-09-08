import React from 'react';
import '@/styles/components/branchStorage.css'
import { Card, CardContent } from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

export default function BranchStorage() {
  return (
    <div>
      <div className='pc-tablet'>
        <Card className='branch-card'>
          <CardContent className='op-branch-card-contents'>
            <div className='branch-storage-stats'>
              <div className='upper-branch-stats'>
                <div className='branch-stats'>
                  <h1 className='h1-sp1'>26</h1>
                  <h4 className='bold'>Shoes</h4>
                </div>
                <div className='branch-stats'>
                  <h1 className='h1-sp1 regular'>70%</h1>
                  <h4 className='bold'>Storage Left</h4>
                </div>
              </div>
              <h4 className='bold'>SM Grand</h4>
            </div>

            <div className='branch-storage-stats'>
              <div className='upper-branch-stats'>
                <div className='branch-stats'>
                  <h1 className='h1-sp1'>30</h1>
                  <h4 className='bold'>Shoes</h4>
                </div>
                <div className='branch-stats'>
                  <h1 className='h1-sp1 regular'>50%</h1>
                  <h4 className='bold'>Storage Left</h4>
                </div>
              </div>
              <h4 className='bold'>SM Valenzuela</h4>
            </div>

            <div className='branch-storage-stats'>
              <div className='upper-branch-stats'>
                <div className='branch-stats'>
                  <h1 className='h1-sp1'>24</h1>
                  <h4 className='bold'>Shoes</h4>
                </div>
                <div className='branch-stats'>
                  <h1 className='h1-sp1 regular'>60%</h1>
                  <h4 className='bold'>Storage Left</h4>
                </div>
              </div>
              <h4 className='bold'>Valenzuela</h4>
            </div>

            <div className='branch-storage-stats'>
              <div className='upper-branch-stats'>
                <div className='branch-stats'>
                  <h1 className='h1-sp1'>326</h1>
                  <h4 className='bold'>Shoes</h4>
                </div>
                <div className='branch-stats'>
                  <h1 className='h1-sp1 regular'>30%</h1>
                  <h4 className='bold'>Storage Left</h4>
                </div>
              </div>
              <h4 className='bold'>Warehouse</h4>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className='landscape-mobile'>
        <Card className='mobile-card'>
            <CardContent>
              <Carousel className='carousel'>
                <CarouselContent>
                  <CarouselItem className='carousel-item'>
                    <div className='branch-storage-stats'>
                      <div className='upper-branch-stats'>
                        <div className='branch-stats'>
                          <h1 className='h1-sp1'>26</h1>
                          <h4 className='bold'>Shoes</h4>
                        </div>
                        <div className='branch-stats'>
                          <h1 className='h1-sp1 regular'>70%</h1>
                          <h4 className='bold'>Storage Left</h4>
                        </div>
                      </div>
                      <h4 className='bold'>SM Grand</h4>
                    </div>

                    <div className='branch-storage-stats'>
                      <div className='upper-branch-stats'>
                        <div className='branch-stats'>
                          <h1 className='h1-sp1'>30</h1>
                          <h4 className='bold'>Shoes</h4>
                        </div>
                        <div className='branch-stats'>
                          <h1 className='h1-sp1 regular'>50%</h1>
                          <h4 className='bold'>Storage Left</h4>
                        </div>
                      </div>
                      <h4 className='bold'>SM Valenzuela</h4>
                    </div>
                  </CarouselItem>
                  <CarouselItem className='carousel-item'>
                    <div className='branch-storage-stats'>
                      <div className='upper-branch-stats'>
                        <div className='branch-stats'>
                          <h1 className='h1-sp1'>24</h1>
                          <h4 className='bold'>Shoes</h4>
                        </div>
                        <div className='branch-stats'>
                          <h1 className='h1-sp1 regular'>60%</h1>
                          <h4 className='bold'>Storage Left</h4>
                        </div>
                      </div>
                      <h4 className='bold'>Valenzuela</h4>
                    </div>
                  
                    <div className='branch-storage-stats'>
                      <div className='upper-branch-stats'>
                        <div className='branch-stats'>
                          <h1 className='h1-sp1'>326</h1>
                          <h4 className='bold'>Shoes</h4>
                        </div>
                        <div className='branch-stats'>
                          <h1 className='h1-sp1 regular'>30%</h1>
                          <h4 className='bold'>Storage Left</h4>
                        </div>
                      </div>
                      <h4 className='bold'>Warehouse</h4>
                    </div>
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
                  <CarouselItem>
                    <div className='branch-storage-stats'>
                      <div className='upper-branch-stats'>
                        <div className='branch-stats'>
                          <h1 className='h1-sp1'>26</h1>
                          <h4 className='bold'>Shoes</h4>
                        </div>
                        <div className='branch-stats'>
                          <h1 className='h1-sp1 regular'>70%</h1>
                          <h4 className='bold'>Storage Left</h4>
                        </div>
                      </div>
                      <h4 className='bold'>SM Grand</h4>
                    </div>
                  </CarouselItem>
                  <CarouselItem>
                    <div className='branch-storage-stats'>
                      <div className='upper-branch-stats'>
                        <div className='branch-stats'>
                          <h1 className='h1-sp1'>30</h1>
                          <h4 className='bold'>Shoes</h4>
                        </div>
                        <div className='branch-stats'>
                          <h1 className='h1-sp1 regular'>50%</h1>
                          <h4 className='bold'>Storage Left</h4>
                        </div>
                      </div>
                      <h4 className='bold'>SM Valenzuela</h4>
                    </div>
                  </CarouselItem>
                  <CarouselItem>
                    <div className='branch-storage-stats'>
                      <div className='upper-branch-stats'>
                        <div className='branch-stats'>
                          <h1 className='h1-sp1'>24</h1>
                          <h4 className='bold'>Shoes</h4>
                        </div>
                        <div className='branch-stats'>
                          <h1 className='h1-sp1 regular'>60%</h1>
                          <h4 className='bold'>Storage Left</h4>
                        </div>
                      </div>
                      <h4 className='bold'>Valenzuela</h4>
                    </div>
                  </CarouselItem>
                  <CarouselItem>
                    <div className='branch-storage-stats'>
                      <div className='upper-branch-stats'>
                        <div className='branch-stats'>
                          <h1 className='h1-sp1'>326</h1>
                          <h4 className='bold'>Shoes</h4>
                        </div>
                        <div className='branch-stats'>
                          <h1 className='h1-sp1 regular'>30%</h1>
                          <h4 className='bold'>Storage Left</h4>
                        </div>
                      </div>
                      <h4 className='bold'>Warehouse</h4>
                    </div>
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