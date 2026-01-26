// STL File Analysis Utility
// This would be used for accurate material calculation

export interface STLAnalysis {
  volume: number // in cubic millimeters
  boundingBox: {
    min: { x: number, y: number, z: number }
    max: { x: number, y: number, z: number }
  }
  triangleCount: number
}

export class STLAnalyzer {
  static async analyzeFile(file: File): Promise<STLAnalysis> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (event) => {
        try {
          const buffer = event.target?.result as ArrayBuffer
          const analysis = this.parseSTL(buffer)
          resolve(analysis)
        } catch (error) {
          reject(error)
        }
      }
      
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsArrayBuffer(file)
    })
  }

  private static parseSTL(buffer: ArrayBuffer): STLAnalysis {
    const view = new DataView(buffer)
    const headerSize = 80
    const triangleCount = view.getUint32(80, true) // little-endian
    
    let minX = Infinity, minY = Infinity, minZ = Infinity
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity
    let totalVolume = 0
    
    // Parse triangles
    for (let i = 0; i < triangleCount; i++) {
      const offset = headerSize + 4 + (i * 50) // 50 bytes per triangle
      
      // Skip normal vector (12 bytes)
      // Read 3 vertices (36 bytes total)
      const vertices = []
      for (let j = 0; j < 3; j++) {
        const vertexOffset = offset + 12 + (j * 12)
        const x = view.getFloat32(vertexOffset, true)
        const y = view.getFloat32(vertexOffset + 4, true)
        const z = view.getFloat32(vertexOffset + 8, true)
        
        vertices.push({ x, y, z })
        
        // Update bounding box
        minX = Math.min(minX, x)
        minY = Math.min(minY, y)
        minZ = Math.min(minZ, z)
        maxX = Math.max(maxX, x)
        maxY = Math.max(maxY, y)
        maxZ = Math.max(maxZ, z)
      }
      
      // Calculate triangle volume using signed tetrahedron method
      const v1 = vertices[0]
      const v2 = vertices[1]
      const v3 = vertices[2]
      
      // Volume of tetrahedron formed by triangle and origin
      const triangleVolume = (v1.x * (v2.y * v3.z - v3.y * v2.z) +
                              v2.x * (v3.y * v1.z - v1.y * v3.z) +
                              v3.x * (v1.y * v2.z - v2.y * v1.z)) / 6
      
      totalVolume += Math.abs(triangleVolume)
    }
    
    return {
      volume: totalVolume, // cubic millimeters
      boundingBox: {
        min: { x: minX, y: minY, z: minZ },
        max: { x: maxX, y: maxY, z: maxZ }
      },
      triangleCount
    }
  }

  static calculateMaterialUsage(
    analysis: STLAnalysis,
    infillPercentage: number = 20,
    layerHeight: number = 0.2,
    materialDensity: number = 1.24 // PLA density g/cm³
  ): {
    volume: number // cubic centimeters
    weight: number // grams
    printTime: number // minutes
  } {
    // Convert volume from mm³ to cm³
    const outerVolume = analysis.volume / 1000
    
    // Account for infill
    const totalVolume = outerVolume * (1 + (infillPercentage / 100))
    
    // Calculate weight
    const weight = totalVolume * materialDensity
    
    // Estimate print time (rough calculation)
    const boundingVolume = 
      (analysis.boundingBox.max.x - analysis.boundingBox.min.x) *
      (analysis.boundingBox.max.y - analysis.boundingBox.min.y) *
      (analysis.boundingBox.max.z - analysis.boundingBox.min.z) / 1000
    
    const layers = (analysis.boundingBox.max.z - analysis.boundingBox.min.z) / layerHeight
    const avgLayerArea = totalVolume / layers
    const printTime = (layers * 2) + (avgLayerArea * 0.5) // Very rough estimate
    
    return {
      volume: totalVolume,
      weight: Math.max(weight, 1), // Minimum 1 gram
      printTime: Math.max(printTime, 10) // Minimum 10 minutes
    }
  }
}
