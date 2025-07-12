'use client';

import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Bucket, Item } from '../types/kanban';
import KanbanItem from './KanbanItem';

interface KanbanBoardProps {
  bucket: Bucket;
  onUpdateBucketName: (bucketId: string, newName: string) => void;
  onAddItem: (bucketId: string) => void;
  onUpdateItem: (bucketId: string, itemId: string, updates: Partial<Item>) => void;
  onDeleteItem: (bucketId: string, itemId: string) => void;
  onDeleteBucket: (bucketId: string) => void;
  activeId: string | null;
}

export default function KanbanBoard({
  bucket,
  onUpdateBucketName,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onDeleteBucket,
  activeId
}: KanbanBoardProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [bucketName, setBucketName] = useState(bucket.name);

  const { setNodeRef } = useDroppable({
    id: bucket.id,
  });

  // Explicitly use the imported variables to satisfy the linter
  const sortableItems = bucket.items.map(item => item.id);
  const sortStrategy = verticalListSortingStrategy;

  const handleNameSubmit = () => {
    if (bucketName.trim()) {
      onUpdateBucketName(bucket.id, bucketName.trim());
    } else {
      setBucketName(bucket.name);
    }
    setIsEditingName(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSubmit();
    } else if (e.key === 'Escape') {
      setBucketName(bucket.name);
      setIsEditingName(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-w-80 max-w-80">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {isEditingName ? (
            <input
              type="text"
              value={bucketName}
              onChange={(e) => setBucketName(e.target.value)}
              onBlur={handleNameSubmit}
              onKeyDown={handleNameKeyDown}
              className="text-lg font-semibold text-gray-900 bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
              autoFocus
            />
          ) : (
            <h3 
              className="text-lg font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
              onClick={() => setIsEditingName(true)}
            >
              {bucket.name}
            </h3>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onAddItem(bucket.id)}
              className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
              title="Add item"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button
              onClick={() => onDeleteBucket(bucket.id)}
              className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-gray-100"
              title="Delete bucket"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
        <div className="text-sm text-gray-500 mt-1">
          {bucket.items.length} {bucket.items.length === 1 ? 'item' : 'items'}
        </div>
      </div>
      
      <div 
        ref={setNodeRef}
        className="p-4 min-h-96 max-h-96 overflow-y-auto"
      >
        <SortableContext items={sortableItems} strategy={sortStrategy}>
          {bucket.items.map(item => (
            <KanbanItem
              key={item.id}
              item={item}
              bucketId={bucket.id}
              onUpdateItem={onUpdateItem}
              onDeleteItem={onDeleteItem}
              isActive={activeId === item.id}
            />
          ))}
        </SortableContext>
        
        {bucket.items.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm">No items yet</p>
            <button
              onClick={() => onAddItem(bucket.id)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2"
            >
              Add your first item
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 