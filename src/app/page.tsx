'use client';

import { useState, useEffect, useRef } from 'react';
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import KanbanBoard from './components/KanbanBoard';
import { Bucket, Item } from './types/kanban';

export default function Home() {
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedBuckets = localStorage.getItem('kanban-buckets');
    if (savedBuckets) {
      setBuckets(JSON.parse(savedBuckets));
    } else {
      // Initialize with default buckets
      const defaultBuckets: Bucket[] = [
        { id: 'todo', name: 'TODO', items: [] },
        { id: 'in-progress', name: 'In Progress', items: [] },
        { id: 'blocked', name: 'Blocked', items: [] },
        { id: 'done', name: 'Done', items: [] },
      ];
      setBuckets(defaultBuckets);
      localStorage.setItem('kanban-buckets', JSON.stringify(defaultBuckets));
    }
  }, []);

  // Save to localStorage whenever buckets change
  useEffect(() => {
    if (buckets.length > 0) {
      localStorage.setItem('kanban-buckets', JSON.stringify(buckets));
    }
  }, [buckets]);

  // Handle scroll shadows
  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setShowLeftShadow(scrollLeft > 0);
        setShowRightShadow(scrollLeft < scrollWidth - clientWidth - 1);
      }
    };

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      handleScroll(); // Check initial state
      
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [buckets]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    // Find the source and destination buckets
    const sourceBucket = buckets.find(bucket => 
      bucket.items.some((item: Item) => item.id === activeId)
    );
    const destinationBucket = buckets.find(bucket => bucket.id === overId) || 
                           buckets.find(bucket => 
                             bucket.items.some((item: Item) => item.id === overId)
                           );

    if (!sourceBucket || !destinationBucket) return;

    // If dropping on a bucket (not an item)
    if (destinationBucket && !destinationBucket.items.some((item: Item) => item.id === overId)) {
      const sourceBucketIndex = buckets.findIndex(bucket => bucket.id === sourceBucket.id);
      const destinationBucketIndex = buckets.findIndex(bucket => bucket.id === destinationBucket.id);
      
      const sourceItemIndex = sourceBucket.items.findIndex((item: Item) => item.id === activeId);
      const item = sourceBucket.items[sourceItemIndex];

      const newBuckets = [...buckets];
      newBuckets[sourceBucketIndex].items = sourceBucket.items.filter((item: Item) => item.id !== activeId);
      newBuckets[destinationBucketIndex].items = [...destinationBucket.items, item];
      
      setBuckets(newBuckets);
      return;
    }

    // If dropping on an item within the same bucket
    if (sourceBucket.id === destinationBucket.id) {
      const bucketIndex = buckets.findIndex(bucket => bucket.id === sourceBucket.id);
      const oldIndex = sourceBucket.items.findIndex((item: Item) => item.id === activeId);
      const newIndex = destinationBucket.items.findIndex((item: Item) => item.id === overId);

      const newBuckets = [...buckets];
      newBuckets[bucketIndex].items = arrayMove(sourceBucket.items, oldIndex, newIndex);
      setBuckets(newBuckets);
      return;
    }

    // If dropping on an item in a different bucket
    const sourceBucketIndex = buckets.findIndex(bucket => bucket.id === sourceBucket.id);
    const destinationBucketIndex = buckets.findIndex(bucket => bucket.id === destinationBucket.id);
    const sourceItemIndex = sourceBucket.items.findIndex((item: Item) => item.id === activeId);
    const destinationItemIndex = destinationBucket.items.findIndex((item: Item) => item.id === overId);

    const item = sourceBucket.items[sourceItemIndex];
    const newBuckets = [...buckets];
    
    newBuckets[sourceBucketIndex].items = sourceBucket.items.filter((item: Item) => item.id !== activeId);
    newBuckets[destinationBucketIndex].items = [
      ...destinationBucket.items.slice(0, destinationItemIndex),
      item,
      ...destinationBucket.items.slice(destinationItemIndex)
    ];

    setBuckets(newBuckets);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const sourceBucket = buckets.find(bucket => 
      bucket.items.some((item: Item) => item.id === activeId)
    );
    const destinationBucket = buckets.find(bucket => bucket.id === overId) || 
                           buckets.find(bucket => 
                             bucket.items.some((item: Item) => item.id === overId)
                           );

    if (!sourceBucket || !destinationBucket) return;

    // If dropping on a bucket (not an item)
    if (destinationBucket && !destinationBucket.items.some((item: Item) => item.id === overId)) {
      const sourceBucketIndex = buckets.findIndex(bucket => bucket.id === sourceBucket.id);
      const destinationBucketIndex = buckets.findIndex(bucket => bucket.id === destinationBucket.id);
      
      const sourceItemIndex = sourceBucket.items.findIndex((item: Item) => item.id === activeId);
      const item = sourceBucket.items[sourceItemIndex];

      const newBuckets = [...buckets];
      newBuckets[sourceBucketIndex].items = sourceBucket.items.filter((item: Item) => item.id !== activeId);
      newBuckets[destinationBucketIndex].items = [...destinationBucket.items, item];
      
      setBuckets(newBuckets);
    }
  };

  const addBucket = () => {
    const newBucket: Bucket = {
      id: `bucket-${Date.now()}`,
      name: 'New Bucket',
      items: []
    };
    setBuckets([...buckets, newBucket]);
  };

  const updateBucketName = (bucketId: string, newName: string) => {
    setBuckets(buckets.map(bucket => 
      bucket.id === bucketId ? { ...bucket, name: newName } : bucket
    ));
  };

  const addItem = (bucketId: string) => {
    const newItem: Item = {
      id: `item-${Date.now()}`,
      title: 'New Item',
      description: '',
      createdAt: new Date().toISOString()
    };
    
    setBuckets(buckets.map(bucket => 
      bucket.id === bucketId 
        ? { ...bucket, items: [...bucket.items, newItem] }
        : bucket
    ));
  };

  const updateItem = (bucketId: string, itemId: string, updates: Partial<Item>) => {
    setBuckets(buckets.map(bucket => 
      bucket.id === bucketId 
        ? { 
            ...bucket, 
            items: bucket.items.map(item => 
              item.id === itemId ? { ...item, ...updates } : item
            )
          }
        : bucket
    ));
  };

  const deleteItem = (bucketId: string, itemId: string) => {
    setBuckets(buckets.map(bucket => 
      bucket.id === bucketId 
        ? { ...bucket, items: bucket.items.filter(item => item.id !== itemId) }
        : bucket
    ));
  };

  const deleteBucket = (bucketId: string) => {
    setBuckets(buckets.filter(bucket => bucket.id !== bucketId));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Kanban Board</h1>
            <button
              onClick={addBucket}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Add Bucket
            </button>
          </div>
        </div>
      </div>
      
      <div className="relative h-[calc(70vh-80px)]">
        {/* Left scroll shadow */}
        {showLeftShadow && (
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none" />
        )}
        
        {/* Right scroll shadow */}
        {showRightShadow && (
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none" />
        )}
        
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
        >
          <div 
            ref={scrollContainerRef}
            className="flex gap-4 px-4 py-4 overflow-x-auto scrollbar-hide h-full mx-16"
            style={{ scrollBehavior: 'smooth' }}
          >
            {buckets.map(bucket => (
              <KanbanBoard
                key={bucket.id}
                bucket={bucket}
                onUpdateBucketName={updateBucketName}
                onAddItem={addItem}
                onUpdateItem={updateItem}
                onDeleteItem={deleteItem}
                onDeleteBucket={deleteBucket}
                activeId={activeId}
              />
            ))}
          </div>
        </DndContext>
      </div>
    </div>
  );
}
