// 月全食动画模拟器
class LunarEclipseSimulator {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;

        // 天体对象
        this.sun = null;
        this.sunGlow = null;
        this.sunCorona = null;
        this.earth = null;
        this.earthAtmosphere = null;
        this.moon = null;

        // 轨道和辅助对象
        this.earthOrbit = null;
        this.moonOrbit = null;
        this.labels = [];

        // 动画参数
        this.animationSpeed = 1.0;
        this.isPlaying = true;
        this.moonAngle = 0;
        this.earthAngle = 0;

        // 轨道倾斜角（模拟真实的5度倾斜）
        this.moonOrbitalInclination = 0.087; // 5度转弧度
        this.currentInclination = 0; // 当前倾斜角，可调节

        // 距离和大小比例（为了视觉效果，不完全按真实比例）
        this.sunRadius = 8;
        this.earthRadius = 2;
        this.moonRadius = 0.5;
        this.earthDistance = 30;
        this.moonDistance = 8;

        // 纹理和材质
        this.textures = {};

        this.init();
    }

    init() {
        this.createTextures();
        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.createControls();
        this.createLights();
        this.createCelestialBodies();
        this.createOrbits();
        this.createLabels();
        this.setupEventListeners();
        this.animate();
    }

    // 创建程序化纹理
    createTextures() {
        // 创建地球纹理
        this.textures.earth = this.createEarthTexture();
        this.textures.earthNormal = this.createEarthNormalMap();

        // 创建月球纹理
        this.textures.moon = this.createMoonTexture();
        this.textures.moonNormal = this.createMoonNormalMap();

        // 创建太阳纹理
        this.textures.sun = this.createSunTexture();
    }

    // 创建地球纹理（蓝绿色大陆和海洋）
    createEarthTexture() {
        const size = 512;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // 基础海洋颜色
        ctx.fillStyle = '#1e6091';
        ctx.fillRect(0, 0, size, size);

        // 添加陆地
        ctx.fillStyle = '#4a7c59';
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const radius = Math.random() * 80 + 30;

            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }

        // 添加云层
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 30; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const radius = Math.random() * 40 + 10;

            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }

        return new THREE.CanvasTexture(canvas);
    }

    // 创建地球法线贴图
    createEarthNormalMap() {
        const size = 256;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // 创建噪声法线贴图
        const imageData = ctx.createImageData(size, size);
        for (let i = 0; i < imageData.data.length; i += 4) {
            const noise = Math.random() * 0.3 + 0.7;
            imageData.data[i] = 128 + (noise - 0.5) * 50;     // R
            imageData.data[i + 1] = 128 + (noise - 0.5) * 50; // G
            imageData.data[i + 2] = 255;                       // B
            imageData.data[i + 3] = 255;                       // A
        }
        ctx.putImageData(imageData, 0, 0);

        return new THREE.CanvasTexture(canvas);
    }

    // 创建月球纹理（灰色表面和陨石坑）
    createMoonTexture() {
        const size = 512;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // 基础月球颜色
        const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
        gradient.addColorStop(0, '#c4c4c4');
        gradient.addColorStop(1, '#8a8a8a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);

        // 添加陨石坑
        ctx.fillStyle = '#666666';
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const radius = Math.random() * 30 + 5;

            // 外环
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();

            // 内环（更暗）
            ctx.fillStyle = '#444444';
            ctx.beginPath();
            ctx.arc(x, y, radius * 0.8, 0, Math.PI * 2);
            ctx.fill();

            // 中心点（最暗）
            ctx.fillStyle = '#333333';
            ctx.beginPath();
            ctx.arc(x, y, radius * 0.3, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#666666';
        }

        return new THREE.CanvasTexture(canvas);
    }

    // 创建月球法线贴图
    createMoonNormalMap() {
        const size = 256;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // 创建凹凸不平的表面
        const imageData = ctx.createImageData(size, size);
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const i = (y * size + x) * 4;
                const noise = Math.random() * 0.5 + 0.5;
                imageData.data[i] = 128 + (noise - 0.5) * 100;     // R
                imageData.data[i + 1] = 128 + (noise - 0.5) * 100; // G
                imageData.data[i + 2] = 255;                        // B
                imageData.data[i + 3] = 255;                        // A
            }
        }
        ctx.putImageData(imageData, 0, 0);

        return new THREE.CanvasTexture(canvas);
    }

    // 创建太阳纹理（火焰效果）
    createSunTexture() {
        const size = 512;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // 基础太阳颜色
        const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
        gradient.addColorStop(0, '#ffff99');
        gradient.addColorStop(0.3, '#ffaa00');
        gradient.addColorStop(0.6, '#ff6600');
        gradient.addColorStop(1, '#cc3300');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);

        // 添加火焰纹理
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const radius = Math.random() * 20 + 5;

            const flameGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
            flameGradient.addColorStop(0, '#ffffff');
            flameGradient.addColorStop(0.5, '#ffaa00');
            flameGradient.addColorStop(1, 'transparent');

            ctx.fillStyle = flameGradient;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    createScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000011);

        // 添加星空背景
        const starGeometry = new THREE.BufferGeometry();
        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 1,
            sizeAttenuation: false
        });

        const starVertices = [];
        for (let i = 0; i < 1000; i++) {
            const x = (Math.random() - 0.5) * 2000;
            const y = (Math.random() - 0.5) * 2000;
            const z = (Math.random() - 0.5) * 2000;
            starVertices.push(x, y, z);
        }

        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        const stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(stars);
    }

    createCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 20, 50);
    }

    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);
    }

    createControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxDistance = 200;
        this.controls.minDistance = 10;
    }

    createLights() {
        // 太阳光源
        this.sunLight = new THREE.PointLight(0xffffff, 2, 200);
        this.sunLight.position.set(0, 0, 0);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.scene.add(this.sunLight);

        // 环境光
        const ambientLight = new THREE.AmbientLight(0x404040, 0.1);
        this.scene.add(ambientLight);
    }

    createCelestialBodies() {
        // 创建太阳
        const sunGeometry = new THREE.SphereGeometry(this.sunRadius, 64, 64);
        const sunMaterial = new THREE.MeshBasicMaterial({
            map: this.textures.sun,
            emissive: 0xffaa00,
            emissiveIntensity: 0.8,
            transparent: true
        });
        this.sun = new THREE.Mesh(sunGeometry, sunMaterial);
        this.scene.add(this.sun);

        // 创建太阳光晕
        const glowGeometry = new THREE.SphereGeometry(this.sunRadius * 1.2, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xffaa00,
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide
        });
        this.sunGlow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.scene.add(this.sunGlow);

        // 创建太阳日冕
        const coronaGeometry = new THREE.SphereGeometry(this.sunRadius * 1.5, 32, 32);
        const coronaMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
        });
        this.sunCorona = new THREE.Mesh(coronaGeometry, coronaMaterial);
        this.scene.add(this.sunCorona);

        // 创建地球
        const earthGeometry = new THREE.SphereGeometry(this.earthRadius, 64, 64);
        const earthMaterial = new THREE.MeshPhongMaterial({
            map: this.textures.earth,
            normalMap: this.textures.earthNormal,
            normalScale: new THREE.Vector2(0.5, 0.5),
            shininess: 30,
            specular: 0x222222
        });
        this.earth = new THREE.Mesh(earthGeometry, earthMaterial);
        this.earth.position.set(this.earthDistance, 0, 0);
        this.earth.castShadow = true;
        this.earth.receiveShadow = true;
        this.scene.add(this.earth);

        // 创建地球大气层
        const atmosphereGeometry = new THREE.SphereGeometry(this.earthRadius * 1.05, 32, 32);
        const atmosphereMaterial = new THREE.MeshBasicMaterial({
            color: 0x88ccff,
            transparent: true,
            opacity: 0.2,
            side: THREE.BackSide
        });
        this.earthAtmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        this.earthAtmosphere.position.copy(this.earth.position);
        this.scene.add(this.earthAtmosphere);

        // 创建月球
        const moonGeometry = new THREE.SphereGeometry(this.moonRadius, 64, 64);
        this.moonMaterial = new THREE.MeshPhongMaterial({
            map: this.textures.moon,
            normalMap: this.textures.moonNormal,
            normalScale: new THREE.Vector2(1.0, 1.0),
            shininess: 5,
            color: 0xcccccc
        });
        this.moon = new THREE.Mesh(moonGeometry, this.moonMaterial);
        this.moon.castShadow = true;
        this.moon.receiveShadow = true;
        this.scene.add(this.moon);
    }

    createOrbits() {
        // 地球轨道
        const earthOrbitGeometry = new THREE.RingGeometry(this.earthDistance - 0.1, this.earthDistance + 0.1, 64);
        const earthOrbitMaterial = new THREE.MeshBasicMaterial({
            color: 0x444444,
            side: THREE.DoubleSide,
            opacity: 0.3,
            transparent: true
        });
        this.earthOrbit = new THREE.Mesh(earthOrbitGeometry, earthOrbitMaterial);
        this.earthOrbit.rotation.x = Math.PI / 2;
        this.scene.add(this.earthOrbit);

        // 月球轨道（相对于地球）
        const moonOrbitGeometry = new THREE.RingGeometry(this.moonDistance - 0.05, this.moonDistance + 0.05, 64);
        const moonOrbitMaterial = new THREE.MeshBasicMaterial({
            color: 0x666666,
            side: THREE.DoubleSide,
            opacity: 0.2,
            transparent: true
        });
        this.moonOrbit = new THREE.Mesh(moonOrbitGeometry, moonOrbitMaterial);
        this.moonOrbit.rotation.x = Math.PI / 2;
        this.scene.add(this.moonOrbit);
    }

    createLabels() {
        // 这里可以添加文字标签，但需要额外的库
        // 为了简化，我们暂时跳过标签功能
    }

    updateMoonPosition() {
        // 考虑轨道倾斜角的月球位置计算
        const moonX = this.earth.position.x + Math.cos(this.moonAngle) * this.moonDistance;
        const moonZ = this.earth.position.z + Math.sin(this.moonAngle) * this.moonDistance;

        // 添加垂直偏移（Y轴）来模拟轨道倾斜
        const moonY = Math.sin(this.moonAngle + this.currentInclination) * this.moonDistance * Math.sin(this.moonOrbitalInclination);

        this.moon.position.set(moonX, moonY, moonZ);

        // 更新月球轨道位置
        this.moonOrbit.position.copy(this.earth.position);

        // 倾斜月球轨道
        this.moonOrbit.rotation.z = this.currentInclination;
    }

    updateEarthPosition() {
        this.earth.position.x = Math.cos(this.earthAngle) * this.earthDistance;
        this.earth.position.z = Math.sin(this.earthAngle) * this.earthDistance;

        // 更新地球大气层位置
        this.earthAtmosphere.position.copy(this.earth.position);
    }

    calculateEclipsePhase() {
        // 计算月食阶段
        const earthPos = this.earth.position;
        const moonPos = this.moon.position;
        const sunPos = this.sun.position;

        // 计算太阳到地球的向量
        const sunToEarth = new THREE.Vector3().subVectors(earthPos, sunPos);
        // 计算地球到月球的向量
        const earthToMoon = new THREE.Vector3().subVectors(moonPos, earthPos);

        // 检查月球是否在地球背面（相对于太阳）
        const sunToEarthNorm = sunToEarth.clone().normalize();
        const earthToMoonNorm = earthToMoon.clone().normalize();

        // 两个向量的点积：如果 > 0，月球在地球背面（可能发生月食）
        const dotProduct = sunToEarthNorm.dot(earthToMoonNorm);

        let phase = "无月食";
        let moonColor = new THREE.Color(0xcccccc);
        let emissiveColor = new THREE.Color(0x000000);

        // 只有当月球在地球背面时才计算月食
        if (dotProduct > 0.3) { // 稍微调整阈值，使月食更少发生
            // 计算月球到地球阴影轴线的距离
            const projectionLength = earthToMoon.dot(sunToEarthNorm);

            // 计算阴影中心点
            const shadowCenter = new THREE.Vector3().copy(earthPos).add(
                sunToEarthNorm.clone().multiplyScalar(projectionLength)
            );

            const distanceToShadow = moonPos.distanceTo(shadowCenter);

            // 地球阴影半径（考虑Y轴偏移，只有当月球接近黄道面时才发生月食）
            const shadowRadius = this.earthRadius * 1.8;
            const verticalOffset = Math.abs(moonPos.y - earthPos.y);

            // 只有当月球垂直偏移很小时才会发生月食（模拟交点）
            if (verticalOffset < this.earthRadius * 0.5 && distanceToShadow < shadowRadius) {
                if (distanceToShadow < shadowRadius * 0.6) {
                    phase = "全食";
                    // 月全食时呈现深红色（大气折射效应）
                    moonColor = new THREE.Color(0x883333); // 更亮的红色
                    emissiveColor = new THREE.Color(0x441111); // 红色发光
                } else if (distanceToShadow < shadowRadius * 0.8) {
                    phase = "偏食";
                    // 偏食时部分呈红色
                    moonColor = new THREE.Color(0xaa6666); // 橙红色
                    emissiveColor = new THREE.Color(0x331100); // 淡橙色发光
                } else {
                    phase = "半影食";
                    moonColor = new THREE.Color(0x999999); // 稍暗但不是红色
                    emissiveColor = new THREE.Color(0x111111); // 很淡的发光
                }
            } else if (verticalOffset < this.earthRadius * 0.8 && distanceToShadow < shadowRadius * 1.2) {
                phase = "半影食";
                moonColor = new THREE.Color(0x999999); // 稍暗
                emissiveColor = new THREE.Color(0x111111); // 很淡的发光
            }
        } else {
            // 月球在太阳和地球之间时（日食位置），月球保持正常颜色
            phase = "无月食";
            moonColor = new THREE.Color(0xcccccc); // 正常颜色
            emissiveColor = new THREE.Color(0x000000); // 无发光
        }

        // 更新月球材质
        this.moonMaterial.color.copy(moonColor);
        this.moonMaterial.emissive.copy(emissiveColor);
        this.moonMaterial.emissiveIntensity = phase === "全食" ? 0.4 : (phase === "偏食" ? 0.2 : 0.1);

        // 更新UI
        document.getElementById('eclipsePhase').textContent = phase;

        return phase;
    }

    setupEventListeners() {
        // 速度控制
        const speedControl = document.getElementById('speedControl');
        const speedValue = document.getElementById('speedValue');
        speedControl.addEventListener('input', (e) => {
            this.animationSpeed = parseFloat(e.target.value);
            speedValue.textContent = this.animationSpeed.toFixed(1) + 'x';
        });

        // 阶段控制
        const phaseControl = document.getElementById('phaseControl');
        const phaseValue = document.getElementById('phaseValue');
        phaseControl.addEventListener('input', (e) => {
            this.moonAngle = (parseFloat(e.target.value) * Math.PI) / 180;
            phaseValue.textContent = e.target.value + '°';
            this.updateMoonPosition();
            this.calculateEclipsePhase();
        });

        // 轨道倾斜角控制
        const inclinationControl = document.getElementById('inclinationControl');
        const inclinationValue = document.getElementById('inclinationValue');
        inclinationControl.addEventListener('input', (e) => {
            const degrees = parseFloat(e.target.value);
            this.currentInclination = (degrees * Math.PI) / 180;
            inclinationValue.textContent = degrees.toFixed(1) + '°';
            this.updateMoonPosition();
            this.calculateEclipsePhase();
        });

        // 初始化倾斜角
        this.currentInclination = (5 * Math.PI) / 180; // 默认5度

        // 播放/暂停
        document.getElementById('playPause').addEventListener('click', () => {
            this.isPlaying = !this.isPlaying;
            document.getElementById('playPause').textContent = this.isPlaying ? '暂停' : '播放';
        });

        // 重置
        document.getElementById('reset').addEventListener('click', () => {
            this.moonAngle = 0;
            this.earthAngle = 0;
            phaseControl.value = 0;
            phaseValue.textContent = '0°';
            this.updateEarthPosition();
            this.updateMoonPosition();
            this.calculateEclipsePhase();
        });

        // 跳转到全食
        document.getElementById('fullEclipse').addEventListener('click', () => {
            this.moonAngle = Math.PI; // 180度，月球在地球阴影中
            phaseControl.value = 180;
            phaseValue.textContent = '180°';
            this.updateMoonPosition();
            this.calculateEclipsePhase();
        });

        // 显示轨道
        document.getElementById('showOrbits').addEventListener('change', (e) => {
            this.earthOrbit.visible = e.target.checked;
            this.moonOrbit.visible = e.target.checked;
        });

        // 窗口大小调整
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        if (this.isPlaying) {
            // 更新角度
            this.moonAngle += 0.02 * this.animationSpeed;
            this.earthAngle += 0.005 * this.animationSpeed;

            // 更新位置
            this.updateEarthPosition();
            this.updateMoonPosition();

            // 更新UI
            const moonDegrees = ((this.moonAngle * 180) / Math.PI) % 360;
            document.getElementById('phaseControl').value = moonDegrees;
            document.getElementById('phaseValue').textContent = moonDegrees.toFixed(0) + '°';

            // 计算月食阶段
            this.calculateEclipsePhase();
        }

        // 太阳动态效果
        const time = Date.now() * 0.001;
        this.sun.rotation.y += 0.01;

        // 光晕效果动画
        this.sunGlow.rotation.x = Math.sin(time * 0.5) * 0.1;
        this.sunGlow.rotation.z = Math.cos(time * 0.3) * 0.1;
        this.sunGlow.material.opacity = 0.25 + Math.sin(time * 2) * 0.05;

        // 日冕效果动画
        this.sunCorona.rotation.y += 0.005;
        this.sunCorona.rotation.x = Math.sin(time * 0.2) * 0.05;
        this.sunCorona.material.opacity = 0.08 + Math.sin(time * 1.5) * 0.02;

        // 旋转天体
        this.earth.rotation.y += 0.05;
        this.moon.rotation.y += 0.02;

        // 地球大气层轻微闪烁
        this.earthAtmosphere.material.opacity = 0.18 + Math.sin(time * 3) * 0.02;

        // 太阳纹理动画
        if (this.textures.sun) {
            this.textures.sun.offset.x += 0.001;
            this.textures.sun.offset.y += 0.0005;
        }

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

// 启动应用
window.addEventListener('load', () => {
    new LunarEclipseSimulator();
});