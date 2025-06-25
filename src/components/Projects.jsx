import { Image, Text } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { animate, useMotionValue, useSpring } from "framer-motion";

import { motion } from "framer-motion-3d";
import { atom, useAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
const colors = [
  "#F472B6", // pink
  "#4ADE80", // green
  "#60A5FA", // blue
  "#FACC15", // yellow
  "#A78BFA", // purple
];

export const projects = [
  {
    title: "Portfolio Website",
    url: "https://github.com/hlahtoo/portfolio-v2",
    image: "projects/Portfolio.png",
    languages_tools: ["#React", "#React-three", "#Tailwind", "#Gsap"],
    description:
      "A dynamic 3D portfolio website showcasing my work with immersive visuals, styling, and smooth animations",
  },
  {
    title: "V-Notebook",
    url: "https://v-notebook.com",
    image: "projects/v-notebook.png",
    languages_tools: ["#ReactJS", "#Mongodb", "#Flask", "#AWS"],
    description:
      "AI Full-Stack Saas Notebook application fully powered by OpenAI",
  },
  {
    title: "Pixel Chatroom",
    url: "https://github.com/toby12352/Pixel-Chatroom",
    image: "projects/PixelChatroom.gif",
    languages_tools: ["#React", "TailwindCSS"],
    description:
      "A pixel theme chatroom for my visitors built using Reactjs deployed on AWS(EC2). No need to sign up!",
  },
  {
    title: "3D Sky Island",
    url: "https://github.com/toby12352/3D-Website",
    image: "projects/skyisland.png",
    languages_tools: ["#ReactJS", "#Threejs", "#TailwindCSS"],
    description: "A fun interactive 3D Sky Island",
  },
  {
    title: "Nike Landing page",
    url: "https://github.com/toby12352/nike-sample-landing-page",
    image: "projects/nike_landingpage.png",
    languages_tools: ["#ReactJS", "#Vite", "#TailwindCSS"],
    description:
      "Recreation of a responsive nike landing page. Works on multiple platforms",
  },
];

const Project = (props) => {
  const { project, highlighted } = props;

  const background = useRef();
  const bgOpacity = useMotionValue(0.4);

  useEffect(() => {
    animate(bgOpacity, highlighted ? 0.8 : 0.4);
  }, [highlighted]);

  useFrame(() => {
    background.current.material.opacity = bgOpacity.get();
  });

  return (
    <group {...props}>
      <mesh
        position-z={-0.001}
        onClick={() => window.open(project.url, "_blank")}
        ref={background}
      >
        <planeGeometry args={[2.86, 3]} />
        <meshBasicMaterial color="black" transparent opacity={0.3} />
      </mesh>
      <Image
        scale={[2.6, 1.56, 1.3]}
        url={project.image}
        transparent
        toneMapped={false} // ✅ Fix unwanted brightness adjustments
        position-y={0.6}
        onLoad={(texture) => {
          texture.minFilter = THREE.LinearFilter; // ✅ Fix texture bleeding
          texture.magFilter = THREE.LinearFilter;
          texture.generateMipmaps = false; // ✅ Prevent artifacts
        }}
      />
      <Text
        maxWidth={2.6}
        anchorX="left"
        anchorY="top"
        fontSize={0.26}
        position={[-1.3, -0.2, 0]}
        renderOrder={1} // Three.js sometimes renders text at a lower resolution. Setting renderOrder ensures it renders properly.
      >
        {project.title.toUpperCase()}
      </Text>
      <Text
        maxWidth={2.6}
        anchorX="left"
        anchorY="top"
        fontSize={0.13}
        position={[-1.3, -0.58, 0]}
        renderOrder={1}
      >
        {project.description}
      </Text>

      {/* Language / Tool Tags */}
      {project.languages_tools && (
        <group position={[0, -1.25, 0]}>
          {project.languages_tools
            .map((tag, i) => {
              const ref = useRef();
              const [x, setX] = useState(0);

              useEffect(() => {
                if (ref.current && ref.current.geometry.boundingBox) {
                  const box = ref.current.geometry.boundingBox;
                  const width = box.max.x - box.min.x;
                  setX(width);
                }
              }, []);

              return (
                <Text
                  key={i}
                  ref={ref}
                  fontSize={0.12}
                  color={colors[i % colors.length]}
                  anchorX="left"
                  anchorY="middle"
                  position={[0, 0, 0]}
                  renderOrder={1}
                  onSync={(self) => {
                    self.geometry.computeBoundingBox();
                  }}
                >
                  {tag}
                </Text>
              );
            })
            .reduce((acc, textEl, i) => {
              if (i === 0) {
                textEl.props.position[0] = -1.3;
              } else {
                const prev = acc[i - 1];
                const prevX = prev.props.position[0];
                const prevWidth =
                  prev.ref?.current?.geometry?.boundingBox?.max.x ?? 0;
                const spacing = 0.15;

                textEl.props.position[0] = prevX + prevWidth + spacing;
              }
              return [...acc, textEl];
            }, [])}
        </group>
      )}
    </group>
  );
};

export const currentProjectAtom = atom(Math.floor(projects.length / 2));

export const Projects = () => {
  const { viewport, size } = useThree();
  const [currentProject] = useAtom(currentProjectAtom);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Motion values for mouse movement
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring values for tilt effect
  const tiltX = useSpring(useMotionValue(0), {
    stiffness: 60,
    damping: 10,
  });
  const tiltY = useSpring(useMotionValue(0), {
    stiffness: 60,
    damping: 10,
  });

  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (event) => {
      const x = (event.clientX / size.width) * 2 - 1;
      const y = (event.clientY / size.height) * 2 - 1;
      mouseX.set(x);
      mouseY.set(y);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [size]);

  // Animate tilt based on hover
  useEffect(() => {
    if (hoveredIndex === currentProject) {
      const unsubX = mouseX.on("change", (x) => {
        tiltY.set(x * 0.6); // mouseX affects rotationY
      });
      const unsubY = mouseY.on("change", (y) => {
        tiltX.set(y * 0.6); // mouseY affects rotationX (invert for natural feel)
      });
      return () => {
        unsubX();
        unsubY();
      };
    } else {
      // Eases back to original rotation
      tiltX.set(0);
      tiltY.set(0);
    }
  }, [hoveredIndex, currentProject]);
  return (
    <group position-y={-viewport.height * 2 + 1}>
      {projects.map((project, index) => {
        const groupRef = useRef();

        useFrame(() => {
          if (!groupRef.current) return;

          if (index === currentProject) {
            // If current project, allow tilt animation
            groupRef.current.rotation.x = tiltX.get();
            groupRef.current.rotation.y = tiltY.get();
          } else {
            // Otherwise lock to fixed rotated angle
            groupRef.current.rotation.x = -Math.PI / 3;
            groupRef.current.rotation.y = 0;
          }
        });

        return (
          <motion.group
            key={"project_" + index}
            ref={groupRef}
            position={[index * 3.5, 0, -3]}
            animate={{
              x: 0 + (index - currentProject) * 3.25,
              y: currentProject === index ? 0 : -0.1,
              z: currentProject === index ? -2 : -3,
              rotateX: currentProject === index ? 0 : -Math.PI / 3,
              rotateZ: currentProject === index ? 0 : -0.1 * Math.PI,
            }}
            onPointerOver={() => setHoveredIndex(index)}
            onPointerOut={() => setHoveredIndex(null)}
          >
            <Project project={project} highlighted={index === currentProject} />
          </motion.group>
        );
      })}
    </group>
  );
};
