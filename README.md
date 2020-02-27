In the code implemented here the Ray Tracer has been divided into different componenets

## Camera  
  Camera Object contatins the following Components of the Raytracer:
#    1. Ray
       - Origin:    (Vector4) defines where the ray originates from
       - Direction: (Vector4) defines the direction of the ray
    
#    2. Camera
    There are two factors defining the camera :
    - Extrinsic Factors
    - Intrinsic Factors
    
#    a. EXTRINSIC FACTORS:
       - eyePt: (Vector4) defines the position of camera in World Space Co-ordinates.
       - uAxis: (Vector4) Camera's x-Axis in World Co-ordinates.
       - vAxis: (Vector4) Camera's y-Axis in World Co-ordinates.
       - nAxis: (Vector4) Camera's z_Axis in World Co-ordinates.
#    b. INTRINSIC FACTORS:
       - 