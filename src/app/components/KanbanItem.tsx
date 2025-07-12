'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Item } from '../types/kanban';

interface KanbanItemProps {
  item: Item;
  bucketId: string;
  onUpdateItem: (bucketId: string, itemId: string, updates: Partial<Item>) => void;
  onDeleteItem: (bucketId: string, itemId: string) => void;
  isActive: boolean;
}

export default function KanbanItem({
  item,
  bucketId,
  onUpdateItem,
  onDeleteItem,
  isActive
}: KanbanItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleTitleSubmit = () => {
    if (title.trim()) {
      onUpdateItem(bucketId, item.id, { title: title.trim() });
    } else {
      setTitle(item.title);
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSubmit();
    } else if (e.key === 'Escape') {
      setTitle(item.title);
      setIsEditingTitle(false);
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };

  const handleDescriptionBlur = () => {
    onUpdateItem(bucketId, item.id, { description: description.trim() });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white border border-gray-200 rounded-lg p-3 mb-3 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow ${
        isDragging ? 'opacity-50 rotate-2' : ''
      } ${isActive ? 'ring-2 ring-blue-500' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {isEditingTitle ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={handleTitleKeyDown}
              className="w-full text-sm font-medium text-gray-900 bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-500 rounded px-1 py-0.5"
              autoFocus
            />
          ) : (
            <h4 
              className="text-sm font-medium text-gray-900 cursor-pointer hover:bg-gray-100 px-1 py-0.5 rounded"
              onClick={() => setIsEditingTitle(true)}
            >
              {item.title}
            </h4>
          )}
          
          {!isExpanded && item.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
              {item.description}
            </p>
          )}
          
          {isExpanded && (
            <div className="mt-3 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={handleDescriptionChange}
                  onBlur={handleDescriptionBlur}
                  placeholder="Add a description..."
                  className="w-full text-xs text-gray-900 border border-gray-300 rounded px-2 py-1 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              
              <div className="text-xs text-gray-500">
                Created: {formatDate(item.createdAt)}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1 ml-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            <svg 
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button
            onClick={() => onDeleteItem(bucketId, item.id)}
            className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-gray-100"
            title="Delete item"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      
      {!isExpanded && (
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            {formatDate(item.createdAt)}
          </div>
          {item.description && (
            <div className="text-xs text-blue-600">
              Has description
            </div>
          )}
        </div>
      )}
    </div>
  );
} 