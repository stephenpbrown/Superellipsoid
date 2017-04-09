var superellipsoid = {
    N : 200,
    M : 200,
    m : 2, // m bulge factor
    n : 2, // n bulge factor
	r : 0.1,

    verts: null,
    normals: null,
    triangleStrip : null,
    wireframe : null,
    texCoords : null,

    createGeometry : function() {

        var m = this.m, n = this.n, M = this.M, N = this.N;

        this.verts = new Float32Array((N+1)*(M+1)*3);
        this.normals = new Float32Array((N+1)*(M+1)*3);
        var lats = new Float32Array((N+1)*(M+1));
        var longs = new Float32Array((N+1)*(M+1));

        this.texCoords = new Float32Array(2*(N+1)*(M+1));

        var dv = Math.PI/N, du = 2*Math.PI/M;

        function index(i, j) {
            return ((i * (N + 1)) + j);
        }

        for (var i = 0, v = (-Math.PI/2); i <= N; i++, v += dv) {
            for (var j = 0, u = (Math.PI); j <= M; j++, u -= du) {
                var k = 3*index(i,j);

                if (j === M) u = (Math.PI); // wrap around

                var x1 = (Math.cos(v)*Math.pow(Math.abs(Math.cos(v)), (2.0/m)-1))*(Math.cos(u)*Math.pow(Math.abs(Math.cos(u)), (2.0/n)-1));

                var y1 = (Math.cos(v)*Math.pow(Math.abs(Math.cos(v)), (2.0/m)-1))*(Math.sin(u)*Math.pow(Math.abs(Math.sin(u)),(2.0/n)-1));

                var z1 = (Math.sin(v)*Math.pow(Math.abs(Math.sin(v)), (2.0/m)-1));

                // Javascript has 0*infinity = NaN, so this catches that
                if(isNaN(x1)) x1 = 0;
                if(isNaN(y1)) y1 = 0;
                if(isNaN(z1)) z1 = 0;

                // Fill the vertices
                this.verts[k] = x1;
                this.verts[k+1] = y1;
                this.verts[k+2] = z1;

                // Fill the normals
                this.normals[k] = (Math.cos(v)*Math.pow(Math.abs(Math.cos(v)), 1-(2.0/m)))*(Math.cos(u)*Math.pow(Math.abs(Math.cos(u)), 1-(2.0/n)));
                this.normals[k+1] = (Math.cos(v)*Math.pow(Math.abs(Math.cos(v)), 1-(2.0/m)))*(Math.sin(u)*Math.pow(Math.abs(Math.sin(u)), 1-(2.0/n)));
                this.normals[k+2] = (Math.sin(v)*Math.pow(Math.abs(Math.sin(v)), 1-(2.0/m)));

                // Save latitude vertices
                if(i > 0){
                    var x = this.verts[k] - this.verts[(3*index(i-1,j))];
                    var y = this.verts[k+1] - this.verts[(3*index(i-1,j))+1];
                    var z = this.verts[k+2] - this.verts[(3*index(i-1,j))+2];
                    var d = Math.sqrt((x*x)+(y*y)+(z*z));
                    lats[index(i,j)] = d;
                }

                // Save longitude vertices
                if(j > 0){
                    x = this.verts[k] - this.verts[(3*index(i,j-1))];
                    y = this.verts[k+1] - this.verts[(3*index(i,j-1))+1];
                    z = this.verts[k+2] - this.verts[(3*index(i,j-1))+2];
                    d = Math.sqrt((x*x)+(y*y)+(z*z));
                    longs[index(i,j)] = d;
                }
            }
        }

        // Get the longitude and latitude sums
        var longSums = new Float32Array(M+1);
        var latSums = new Float32Array(M+1);
        for(var i = 0; i <= this.N; i++) {
            for (var j = 0; j <= this.N; j++) {
                longSums[i] += longs[index(i, j)];
                latSums[j] += lats[index(i, j)];
            }
        }

        var texCount = 0;
        var tempLat = new Float32Array(M+1);

        // Add in all the texturing coordinates
        for(var i = 0; i <= N; i++){
            var tempLong = 0;
            for(var j = 0; j <= N; j++){
                tempLong += longs[index(i,j)];
                tempLat[j] += lats[index(i,j)];

                this.texCoords[texCount] = tempLong/longSums[i];

                if(i === 0){
                    this.texCoords[(texCount+1)] = 0;
                } else {
                    this.texCoords[(texCount+1)] = tempLat[j]/latSums[j];
                }

                texCount +=2;
            }
        }
    },

    triangleStrip: null,

    createTriangleStrip : function() {
        var M = this.M, N = this.N;
        var numIndices = N*(2*(M + 1) + 2) - 2;
        if (!this.triangleStrip || this.triangleStrip.length != numIndices)
            this.triangleStrip = new Uint16Array(numIndices);
        var index = function(i, j) {
            return i*(M+1) + j;
        };
        var n = 0;
        for (var i = 0; i < N; i++) {
            if (i > 0)
                this.triangleStrip[n++] = index(i,0);
            for (var j = 0; j <= M; j++) {
                this.triangleStrip[n++] = index(i+1,j);
                this.triangleStrip[n++] = index(i,j);
            }
            if (i < N-1)
                this.triangleStrip[n++] = index(i,M)
        }
    },

    wireframe : null, // Uint16Array  (line indices)

    createWireFrame : function() {
        var lines = [];
        lines.push(this.triangleStrip[0], this.triangleStrip[1]);
        var numStripIndices = this.triangleStrip.length;
        for (var i = 2; i < numStripIndices; i++) {
            var a = this.triangleStrip[i-2];
            var b = this.triangleStrip[i-1];
            var c = this.triangleStrip[i];
            if (a != b && b != c && c != a)
                lines.push(a, c, b, c);
        }
        this.wireframe = new Uint16Array(lines);
    },

    numHedgeHogElements : 0,
    hedgeHog : null,  // Float32Array of lines

    createHedgeHog : function() {
        var lines = [];
        var hedgeHogLength = 0.8*this.r;
        var numNormals = this.normals.length;
        for (var i = 0; i < numNormals; i += 3) {
            var p = [this.verts[i], this.verts[i+1], this.verts[i+2]];
            var n = [this.normals[i], this.normals[i+1], this.normals[i+2]];
            var q = [p[0] + hedgeHogLength*n[0],
                p[1] + hedgeHogLength*n[1],
                p[2] + hedgeHogLength*n[2]];
            lines.push(p[0], p[1], p[2],
                q[0], q[1], q[2]);
        }
        this.numHedgeHogElements = lines.length/3;
        this.hedgeHog = new Float32Array(lines);
    }
};

