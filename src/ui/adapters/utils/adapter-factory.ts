/**
 * Adapter Factory Utility
 * 
 * Factory function for creating adapter components
 */

import React from 'react';
import { AdapterComponent, AdapterProps } from './adapter-types';

/**
 * Creates an adapter component that can switch between different UI libraries
 */
export function createAdapterComponent<T extends AdapterProps>(
  name: string,
  adapters: Record<string, React.ComponentType<T>>
): AdapterComponent<T> {
  const AdapterComponent: AdapterComponent<T> = (props) => {
    const { adapter = 'ant-design', ...componentProps } = props;
    
    const Component = adapters[adapter];
    
    if (!Component) {
      console.warn(`Adapter "${adapter}" not found for component "${name}". Using default.`);
      const defaultAdapter = Object.keys(adapters)[0];
      const DefaultComponent = adapters[defaultAdapter];
      return React.createElement(DefaultComponent, componentProps as T);
    }
    
    return React.createElement(Component, componentProps as T);
  };
  
  AdapterComponent.displayName = `Adapter(${name})`;
  AdapterComponent.adapters = adapters;
  
  return AdapterComponent;
}