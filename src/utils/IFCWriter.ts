import * as WebIFC from "web-ifc";
import * as path from "path";
import { randomUUID } from "crypto";
import fs from 'fs';


export class IFCWriter{

    private IFCAPI = new WebIFC.IfcAPI(); 
    private modelId: number = 0;
    private maxExpressId: number = 0;
    
    
    constructor(filename: string, author: string){
        this.init(filename, author);
    }

    async init(filename: string, author: string){
        await this.IFCAPI.Init();
        this.IFCAPI.SetWasmPath( path.join( __dirname, "../assets/wasm/") ); 

        const newIfcModel = {
            schema: WebIFC.Schemas.IFC4,
            name: filename,
            description: ['IFC Model'],
            authors: [author],
            organizations: []
        }

        this.modelId = this.IFCAPI.CreateModel( newIfcModel );

        const org = new WebIFC.IFC4.IfcOrganization(
            // this.maxExpressId++,
            null,
            new WebIFC.IFC4.IfcLabel('Mazri'),
            null,null,null
        )

        this.IFCAPI.WriteLine( this.modelId, org );

        const app = new WebIFC.IFC4.IfcApplication(
            // this.maxExpressId++,
            org,
            new WebIFC.IFC4.IfcLabel('0.0.1'),
            new WebIFC.IFC4.IfcIdentifier('my application'),
            new WebIFC.IFC4.IfcIdentifier('app')
        );

        this.IFCAPI.WriteLine( this.modelId, app );

        //Units 

        const unit_1 = new WebIFC.IFC4.IfcSIUnit(
            // this.maxExpressId++,
            WebIFC.IFC4.IfcUnitEnum.LENGTHUNIT,
            WebIFC.IFC4.IfcSIPrefix.MILLI,
            WebIFC.IFC4.IfcSIUnitName.METRE
        );

        const unitAssign = new WebIFC.IFC4.IfcUnitAssignment(
            // this.maxExpressId++,
            [unit_1]
        );

        this.IFCAPI.WriteLine( this.modelId, unitAssign );

        //Geom rep

        const origin = [
            new WebIFC.IFC4.IfcLengthMeasure(0),
            new WebIFC.IFC4.IfcLengthMeasure(0),
            new WebIFC.IFC4.IfcLengthMeasure(0),
        ]

        const cartPoint = new WebIFC.IFC4.IfcCartesianPoint(
            // this.maxExpressId++,
            origin
        )
        this.IFCAPI.WriteLine( this.modelId, cartPoint );


        origin[2].value = 1;

        const dir = new WebIFC.IFC4.IfcDirection(
            // this.maxExpressId++,
            origin
        )

        this.IFCAPI.WriteLine( this.modelId, dir );

        const axis = new WebIFC.IFC4.IfcAxis2Placement3D(
            // this.maxExpressId++,
            cartPoint,
            null,
            null
        )

        this.IFCAPI.WriteLine( this.modelId, axis );


        const geomContex = new WebIFC.IFC4.IfcGeometricRepresentationContext(
            // this.maxExpressId++,
            new WebIFC.IFC4.IfcLabel('3D'),
            new WebIFC.IFC4.IfcLabel('Model'),
            new WebIFC.IFC4.IfcDimensionCount(3),
            null,
            axis,
            dir
        )

        this.IFCAPI.WriteLine( this.modelId, geomContex );

        const proj = new WebIFC.IFC4.IfcProject(
            // this.maxExpressId++,
            this.generateGlobalId(),
            null,
            new WebIFC.IFC4.IfcLabel('project'),
            new WebIFC.IFC4.IfcText('project desc'),
            null,
            null,
            null,
            [geomContex],
            unitAssign
        )

        this.IFCAPI.WriteLine( this.modelId, proj );

        // Spatial structure

        const site = new WebIFC.IFC4.IfcSite(
            // this.maxExpressId++,
            this.generateGlobalId(),
            null,
            new WebIFC.IFC4.IfcLabel('my site'),
            new WebIFC.IFC4.IfcText(''),
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null
        );
        this.IFCAPI.WriteLine( this.modelId, site);

        let relAggr = new WebIFC.IFC4.IfcRelAggregates(
            // this.maxExpressId++,
            this.generateGlobalId(),
            null,
            null,
            null,
            proj,
            [site]
        );

        this.IFCAPI.WriteLine( this.modelId, relAggr );


        const building = new WebIFC.IFC4.IfcBuilding(
            // this.maxExpressId++,
            this.generateGlobalId(),
            null,
            new WebIFC.IFC4.IfcLabel('building'),
            new WebIFC.IFC4.IfcText(''),
            null,
            null,null,null,null,null,null,null
        );

        this.IFCAPI.WriteLine( this.modelId,building );

        relAggr.expressID = this.maxExpressId++
        relAggr.GlobalId = this.generateGlobalId();
        relAggr.RelatedObjects = [building];
        relAggr.RelatingObject = site;

        this.IFCAPI.WriteLine( this.modelId, relAggr );

        const buildingStorey = new WebIFC.IFC4.IfcBuildingStorey(
            // this.maxExpressId++,
            this.generateGlobalId(),
            null,
            new WebIFC.IFC4.IfcLabel('Level 0'),
            new WebIFC.IFC4.IfcText('Datum'),
            null,
            null,null,null,null,
            new WebIFC.IFC4.IfcPositiveLengthMeasure(0)
        );

        this.IFCAPI.WriteLine( this.modelId,buildingStorey );

        relAggr.expressID = this.maxExpressId++
        relAggr.GlobalId = this.generateGlobalId();
        relAggr.RelatedObjects = [buildingStorey];
        relAggr.RelatingObject = building;

        this.IFCAPI.WriteLine( this.modelId, relAggr );

        this.saveModel(this.IFCAPI, this.modelId);
    }

    private generateGlobalId(): WebIFC.IFC4.IfcGloballyUniqueId {
        return new WebIFC.IFC4.IfcGloballyUniqueId( randomUUID() );
    }

    private saveModel( ifcApi: any, modelId: number, name: string = "newIFCFile.ifc"): void {
        const bin = ifcApi.SaveModel(modelId);        
    
        const dir = path.join( __dirname, '../assets/ifcFiles' );
    
        if ( !fs.existsSync( dir ) ) fs.mkdirSync( dir );
        fs.writeFileSync( path.join(dir, name), bin );
    }

}